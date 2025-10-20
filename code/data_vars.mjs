//@ts-check
class DocVars{
    constructor(){
        this.vars = {
            DOCNUM: "",
            SHORTDATE: "",
            LONGDATE: "",
            SHORTMODELS: ""
        }
    }

    /**
     * 
     * @param {HTMLElement} topElement 
     */
    InjectVars = (topElement) => {
        let elements = document.querySelectorAll("[data-vars]");
        elements.forEach( (e) => {
            let varName = e.getAttribute("data-vars");
            if(this.vars[varName]){
                e.textContent = this.vars[varName];
            }
            else{
                throw "unrecognized or unset variable";
            }
        });
    }
}

export {DocVars}