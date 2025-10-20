import { DocVars } from "./code/data_vars.mjs";
import { DocSection } from "./code/DocSection.mjs";
import { tocPostProcess } from "./code/TocPostProcess.mjs";

//@ts-check






let renderDoc = (isWebRender, docDefFile) => {
    /**@type {DocSection} */
    let DocDef = null;
    /**@type {DocVars} */
    let docVars = null;
    /**@type {DocSection} */
    let def_Sec_1 = null;
    /**@type {DocSection} */
    let def_Sec_2 = null;
    /**@type {DocSection} */
    let def_Sec_3 = null;
    /**@type {DocSection} */
    let def_Sec_4 = null;
    /**@type {DocSection} */
    let def_Sec_5 = null;
    /**@type {DocSection} */
    let def_Sec_6 = null;

    let loadData = async () => {
        const D = await import(docDefFile);
        DocDef = D.DocDef;
        docVars = D.docVars;
        def_Sec_1 = D.def_Sec_1;
        def_Sec_2 = D.def_Sec_2;
        def_Sec_3 = D.def_Sec_3;
        def_Sec_4 = D.def_Sec_4;
        def_Sec_5 = D.def_Sec_5;
        def_Sec_6 = D.def_Sec_6;


        //Inject headers and sidebars for PDF docs
        if (!isWebRender) {
            let injectHeaders = async () => {
                let hdrs = await fetch("./html/PageDecoration/headers.html");
                let data = await hdrs.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, "text/html");

                doc.body.childNodes.forEach(c => {
                    document.body.appendChild(c);
                });
            }
            let injectSidebars = async () => {
                let sidebars = await fetch("./html/PageDecoration/sidebars.html");
                let data = await sidebars.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, "text/html");

                doc.body.childNodes.forEach(c => {
                    document.body.appendChild(c);
                });
            }
            await injectHeaders();
            await injectSidebars();
        }


        await DocDef.GetContent();
        if (!globalThis.isWebRender) {
            DocDef.RenderContent(true, document.body);
        }
        else {
            DocDef.RenderContent(true, globalThis.contentTarget);
        }

        docVars.InjectVars(document.body);




        let figs_Sec1 = def_Sec_1.NumberFigures("Figure 1-");
        let figs_Sec2 = def_Sec_2.NumberFigures("Figure 2-");
        let figs_Sec3 = def_Sec_3.NumberFigures("Figure 3-");
        let figs_Sec4 = def_Sec_4.NumberFigures("Figure 4-");
        let figs_Sec5 = def_Sec_5.NumberFigures("Figure 5-");
        let figs_Sec6 = def_Sec_6.NumberFigures("Figure 6-");
        let allFigs = figs_Sec1.concat(figs_Sec2, figs_Sec3, figs_Sec4, figs_Sec5, figs_Sec6);



        DocDef.ResolveXrefs(DocDef, allFigs);




        if (!isWebRender) {
            let tocDiv1 = document.createElement("div");
            def_Sec_1.CreateToc(false, tocDiv1, 0, "1-");
            def_Sec_1.InsertToc(tocDiv1, true, true, "Table of Contents", "tocHeader");

            let tocDiv2 = document.createElement("div");
            def_Sec_2.CreateToc(false, tocDiv2, 0, "2-");
            def_Sec_2.InsertToc(tocDiv2, true, true, "Table of Contents", "tocHeader");

            let tocDiv3 = document.createElement("div");
            def_Sec_3.CreateToc(false, tocDiv3, 0, "3-");
            def_Sec_3.InsertToc(tocDiv3, true, true, "Table of Contents", "tocHeader");

            let tocDiv4 = document.createElement("div");
            def_Sec_4.CreateToc(false, tocDiv4, 0, "4-");
            def_Sec_4.InsertToc(tocDiv4, true, true, "Table of Contents", "tocHeader");

            let tocDiv5 = document.createElement("div");
            def_Sec_5.CreateToc(false, tocDiv5, 0, "5-");
            def_Sec_5.InsertToc(tocDiv5, true, true, "Table of Contents", "tocHeader");

            let tocDiv6 = document.createElement("div");
            def_Sec_6.CreateToc(false, tocDiv6, 0, "6-");
            def_Sec_6.InsertToc(tocDiv6, true, true, "Table of Contents", "tocHeader");



            let st = document.createElement("link");
            st.rel = "stylesheet";
            st.href = "code/Paged.js/interface.css";
            document.head.appendChild(st);

            //@ts-ignore
            window.PagedConfig = {
                before: () => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => { resolve() }, 1000);
                    })
                },
                after: (flow) => {
                    console.log("after", flow)
                    tocPostProcess();
                }
            };


            let sc = document.createElement("script");
            sc.src = "code/Paged.js/paged.polyfill.js"
            document.body.appendChild(sc);

        }

    }
    loadData();
};





export { renderDoc }
