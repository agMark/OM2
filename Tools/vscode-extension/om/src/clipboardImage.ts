import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as cp from 'child_process';

export interface ClipboardImageResult {
	/** Absolute path of the PNG written to a temp folder, or undefined if the clipboard held no image. */
	tempFile?: string;
	/** Set when reading failed for a reason other than "no image on the clipboard". */
	error?: string;
}

/** Removes the temp folder a clipboard image was extracted into. Safe to call more than once. */
export function disposeClipboardImage(tempFile: string): void {
	try {
		fs.rmSync(path.dirname(tempFile), { recursive: true, force: true });
	} catch {
		// Best-effort — it's only a temp folder.
	}
}

// VS Code's `env.clipboard` API is text-only, so the image has to come from the OS. Exit code 2 is our
// own "clipboard has no image" signal (any other non-zero is a real failure). -STA is required because
// System.Windows.Forms.Clipboard refuses to run on an MTA thread. The output path is passed through an
// env var rather than interpolated into the script so spaces/quotes in it can't break the command.
const WINDOWS_SCRIPT = [
	"$ErrorActionPreference = 'Stop'",
	'Add-Type -AssemblyName System.Windows.Forms',
	'Add-Type -AssemblyName System.Drawing',
	'$img = [System.Windows.Forms.Clipboard]::GetImage()',
	'if ($null -eq $img) { exit 2 }',
	'try { $img.Save($env:OM_CLIP_OUT, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $img.Dispose() }'
].join('; ');

/**
 * Saves the image currently on the system clipboard (e.g. a Snipping Tool / Win+Shift+S capture, or
 * "Copy image" from a browser) as a PNG in a fresh temp folder. The caller owns the file and should
 * call disposeClipboardImage() when done with it.
 */
export function readClipboardImageToTemp(): Promise<ClipboardImageResult> {
	if (process.platform !== 'win32') {
		return Promise.resolve({ error: 'Pasting an image from the clipboard is currently only supported on Windows.' });
	}

	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'om-clip-'));
	const tempFile = path.join(tempDir, 'clipboard.png');

	return new Promise((resolve) => {
		cp.execFile(
			'powershell.exe',
			['-STA', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', WINDOWS_SCRIPT],
			{ env: { ...process.env, OM_CLIP_OUT: tempFile }, timeout: 15000, windowsHide: true },
			(error, _stdout, stderr) => {
				if (!error) {
					resolve({ tempFile });
					return;
				}
				disposeClipboardImage(tempFile);
				// For a process that ran and exited non-zero, Node puts the exit code (a number) in `code`.
				if ((error as { code?: unknown }).code === 2) {
					resolve({});
					return;
				}
				resolve({ error: (stderr || error.message).trim() });
			}
		);
	});
}
