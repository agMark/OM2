import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as http from 'http';
import { MODEL_IDS } from './modelIndex';

interface DetectedBrowser {
	label: string;
	exePath: string;
}

/**
 * Known install locations for common Windows browsers, checked directly with `fs.existsSync` rather
 * than routing browser choice through Live Server's own `liveServer.settings.CustomBrowser` setting —
 * that setting has no per-invocation override, so using it here would mean mutating the user's global
 * config just to pick a browser once (and racing to restore it before Live Server reads it back).
 */
function detectInstalledBrowsers(): DetectedBrowser[] {
	const programFiles = process.env['ProgramFiles'] ?? '';
	const programFilesX86 = process.env['ProgramFiles(x86)'] ?? '';
	const localAppData = process.env['LOCALAPPDATA'] ?? '';
	const candidates: DetectedBrowser[] = [
		{ label: 'Google Chrome', exePath: path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe') },
		{ label: 'Google Chrome', exePath: path.join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe') },
		{ label: 'Google Chrome', exePath: path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe') },
		{ label: 'Microsoft Edge', exePath: path.join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe') },
		{ label: 'Microsoft Edge', exePath: path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe') },
		{ label: 'Mozilla Firefox', exePath: path.join(programFiles, 'Mozilla Firefox\\firefox.exe') },
		{ label: 'Mozilla Firefox', exePath: path.join(programFilesX86, 'Mozilla Firefox\\firefox.exe') },
		{ label: 'Brave', exePath: path.join(programFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe') },
		{ label: 'Brave', exePath: path.join(localAppData, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe') }
	];
	const found: DetectedBrowser[] = [];
	const seenLabels = new Set<string>();
	for (const candidate of candidates) {
		if (seenLabels.has(candidate.label) || !candidate.exePath) {
			continue;
		}
		if (fs.existsSync(candidate.exePath)) {
			found.push(candidate);
			seenLabels.add(candidate.label);
		}
	}
	return found;
}

function checkReachable(url: string, timeoutMs: number): Promise<boolean> {
	return new Promise((resolve) => {
		const req = http.get(url, (res) => {
			res.destroy();
			resolve(true);
		});
		req.setTimeout(timeoutMs, () => req.destroy());
		req.on('error', () => resolve(false));
	});
}

async function waitUntilReachable(url: string, totalTimeoutMs: number): Promise<boolean> {
	const start = Date.now();
	while (Date.now() - start < totalTimeoutMs) {
		if (await checkReachable(url, 500)) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
	return false;
}

/**
 * Ensures Live Server is serving the workspace without popping its own browser tab. Live Server's
 * `goOnline` command always opens a browser unless `liveServer.settings.NoBrowser` is set, and that
 * setting has no per-call override — so this flips it for the duration of the (re)start only, and
 * restores the user's original value immediately after, rather than leaving their setting changed.
 * Skipped entirely if the server is already reachable (the common case), so a normal re-preview
 * doesn't touch the setting at all.
 */
async function ensureLiveServerRunning(indexUri: vscode.Uri, checkUrl: string): Promise<boolean> {
	if (await checkReachable(checkUrl, 500)) {
		return true;
	}
	const config = vscode.workspace.getConfiguration('liveServer.settings');
	const previousNoBrowser = config.get<boolean>('NoBrowser');
	await config.update('NoBrowser', true, vscode.ConfigurationTarget.Global);
	try {
		await vscode.commands.executeCommand('extension.liveServer.goOnline', indexUri);
		return await waitUntilReachable(checkUrl, 8000);
	} finally {
		await config.update('NoBrowser', previousNoBrowser, vscode.ConfigurationTarget.Global);
	}
}

async function openInBrowser(url: string, browser: DetectedBrowser | undefined): Promise<void> {
	if (!browser) {
		await vscode.env.openExternal(vscode.Uri.parse(url));
		return;
	}
	cp.execFile(browser.exePath, [url], (error) => {
		if (error) {
			vscode.window.showErrorMessage(`OM: failed to launch ${browser.label}: ${error.message}`);
		}
	});
}

/**
 * Replaces the "find the right indexNNN.html in the Explorer, right-click, Open with Live Server"
 * flow with a command: pick the model, pick the browser (only browsers actually detected on this
 * machine are offered, plus "Default Browser"), done. Reuses Live Server's own `goOnline` command to
 * actually start/serve — this only automates the navigation and adds browser choice on top.
 */
export async function openManualInLiveServerCommand(workspaceRoot: string): Promise<void> {
	if (!vscode.extensions.getExtension('ritwickdey.liveserver')) {
		vscode.window.showErrorMessage('OM: the "Live Server" extension (ritwickdey.liveserver) is not installed.');
		return;
	}

	const modelPick = await vscode.window.showQuickPick(
		MODEL_IDS.map((model) => ({ label: model, model })),
		{ placeHolder: 'Preview which model?' }
	);
	if (!modelPick) {
		return;
	}

	const browsers = detectInstalledBrowsers();
	const browserPick = await vscode.window.showQuickPick(
		[
			{ label: 'Default Browser', browser: undefined as DetectedBrowser | undefined },
			...browsers.map((browser) => ({ label: browser.label, browser }))
		],
		{ placeHolder: 'Open in which browser?' }
	);
	if (!browserPick) {
		return;
	}

	const indexFileName = `index${modelPick.model}.html`;
	const indexPath = path.join(workspaceRoot, indexFileName);
	if (!fs.existsSync(indexPath)) {
		vscode.window.showErrorMessage(`OM: could not find ${indexFileName} at the workspace root.`);
		return;
	}

	const port = vscode.workspace.getConfiguration('liveServer.settings').get<number>('port', 5500);
	const url = `http://127.0.0.1:${port}/${indexFileName}`;

	const running = await ensureLiveServerRunning(vscode.Uri.file(indexPath), url);
	if (!running) {
		vscode.window.showErrorMessage('OM: Live Server did not come up in time.');
		return;
	}
	await openInBrowser(url, browserPick.browser);
}
