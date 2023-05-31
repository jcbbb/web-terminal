import { Lexer } from "./lexer.js";

class Prompt {
  constructor(i, o) {
    this.input = i
    this.output = o
  }
}

class Terminal {
  constructor(parent) {
    this.programs = {}
    this.history = []
    this.parent = parent
    this.parent.append(this.createPrompt(true))
  }

  registerProgram(program) {
    this.programs[program.name] = program
  }

  createPrompt(autofocus) {
    let div = document.createElement("div");
    let editable = document.createElement("div");
    let span = document.createElement("span");

    span.textContent = "~"

    if (autofocus) {
      editable.setAttribute("autofocus", "true")
    }

    editable.setAttribute("contenteditable", "true");
    editable.classList.add("line__editable")
    div.classList.add("line")

    editable.addEventListener("keydown", this.onKeydown.bind(this));
    //editable.addEventListener("input", onInput)

    div.append(span, editable)

    return div
  }

  onKeydown(e) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.removeAttribute("contenteditable")
        e.currentTarget.removeAttribute("autofocus")
        let el = this.createPrompt()
        e.target.parentNode?.insertAdjacentElement("afterend", el)
        let editable = el.querySelector(".line__editable")
        editable?.focus()
        break
      default:
        break
    }
  }

  onInput(e) {
    //   let input = e.target.innerText
    //   let lexer = Lexer.from(input)
    //
    //   let ranges = []
    //   for (let token = lexer.next(); token.kind != "EOF"; token = lexer.next()) {
    //     if (token.kind === "KEYWORD") {
    //       let r = new Range()
    //       r.setStart(e.target.firstChild, token.x)
    //       r.setEnd(e.target.firstChild, token.y)
    //       ranges.push(r)
    //     }
    //   }
    //
    //   let highlight = new Highlight(...ranges)
    //   CSS.highlights.set("keyword", highlight)
  }
}

class Program {
  constructor(name, exec) {
    this.name = name;
    this.exec = exec;
  }
}

new Terminal(document.querySelector(".terminal"))
