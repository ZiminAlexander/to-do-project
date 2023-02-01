import { createNewElement } from "Project/helpers/createNewElement";

export function createEditTextButton(){
    const editTextButton = createNewElement("button", "edit-button");
    editTextButton.addEventListener("click", editButtonCallback);

    return editTextButton;
}

function editButtonCallback() {
    const editText = this.parentElement.querySelector("textarea");
    editText.disabled = false;
  }