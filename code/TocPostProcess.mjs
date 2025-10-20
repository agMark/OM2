//@ts-check

function tocPostProcess() {


    let sec1Begin = getGlobalPageNumber("Sec_1");
    let sec2Begin = getGlobalPageNumber("Sec_2");
    let sec3Begin = getGlobalPageNumber("Sec_3");
    let sec4Begin = getGlobalPageNumber("Sec_4");
    let sec5Begin = getGlobalPageNumber("Sec_5");
    let sec6Begin = getGlobalPageNumber("Sec_6");


    let TocLinks = document.getElementsByClassName("tocGrid");
    let sectionPrepend = "";
    let sPageNumber = null;
    let elementGlobalPage = -1;
    for (let i = 0; i < TocLinks.length; i++) {
        sPageNumber = TocLinks[i].children[1];
        sectionPrepend = sPageNumber.innerHTML.split("-")[0];
        let href = TocLinks[i].getAttribute("href");
        let id = href.substring(1);
        elementGlobalPage = getGlobalPageNumber(id);

        let sectionBeginPage = -1;
        switch (sectionPrepend) {
            case "1":
                sectionBeginPage = sec1Begin;
                break
            case "2":
                sectionBeginPage = sec2Begin;
                break;
            case "3":
                sectionBeginPage = sec3Begin;
                break;
            case "4":
                sectionBeginPage = sec4Begin;
                break;
            case "5":
                sectionBeginPage = sec5Begin;
                break;
            case "6":
                sectionBeginPage = sec6Begin;
                break;
            default:
                throw "Unrecognized section prepend.";
        }
    
    
    
        let sectionPageNumber = elementGlobalPage - sectionBeginPage + 1;
    
        sPageNumber.innerHTML = sectionPrepend + "-" + sectionPageNumber;
    }


    let xx = 1;
}

function getGlobalPageNumber(elementId) {
    let elementToFind = document.getElementById(elementId);
    if (!elementToFind) {
        throw "Invalid element ID";
    }


    let pagedJsPages = document.getElementsByClassName("pagedjs_page");

    let globalPageNumber = -1;
    for (let i = 0; i < pagedJsPages.length; i++) {
        let X = pagedJsPages[i].querySelector("#" + elementId);
        if (X !== null && X !== undefined) {
            globalPageNumber = i + 1;
        }
    }
    return globalPageNumber;
}

function lookForDuplicateIds() {
    /* Find duplicate DOM ids | (c) 2021 - Petros Kyladitis */
    let uid = Array();
    let did = Array();
    let e = document.querySelectorAll('*[id]');
    for (let i = 0; i < e.length; i++) {
        if (!uid.includes(e[i].id)) {
            uid.push(e[i].id);
        } else {
            did.push(e[i].id);
        }
    }

    let msg = "There are " + (did.length > 0 ? did.length : "NO") + " duplicate ids in DOM\n";
    for (let j = 0; j < did.length; j++) {
        msg += "\n" + did[j];
    }

    console.log(msg);
}

export {tocPostProcess}