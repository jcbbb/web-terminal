import { Lexer, Parser, evalProgram } from "./lexer.js";

class Prompt {
  constructor(i, o) {
    this.input = i
    this.output = o
    this.id = Math.random().toString(32).slice(2)
  }
}

class Terminal {
  constructor(parent) {
    this.programs = {}
    this.history = []
    this.parent = parent
    this.prompts = []

    this.init()
  }

  registerProgram(program) {
    this.programs[program.name] = program
  }

  init() {
    let editables = this.parent.querySelectorAll(".line__editable")
    for (let editable of editables) {
      editable.addEventListener("keydown", this.onKeydown.bind(this))
    }
  }

  renderPrompt(prompt, autofocus) {
    let div = document.createElement("div");
    let editable = document.createElement("div");
    let span = document.createElement("span");
    let output = document.createElement("div")
    let container = document.createElement("div")

    span.textContent = "~"

    editable.setAttribute("contenteditable", "true");
    editable.setAttribute("id", prompt.id)
    editable.classList.add("line__editable")
    div.classList.add("line__container")
    container.classList.add("line")
    output.classList.add("line__output")

    editable.addEventListener("keydown", this.onKeydown.bind(this));
    //editable.addEventListener("input", onInput)

    div.append(span, editable)
    container.append(div, output)
    this.parent.append(container)
    if (autofocus) {
      editable.focus()
    }
  }

  addPrompt(i, o) {
    let prompt = new Prompt(i, o)
    this.prompts.push(prompt)
    return prompt
  }

  deletePrompts() {
    this.prompts.length = 0
  }

  clearPrompts() {
    let lines = this.parent.querySelectorAll(".line")
    let firstLine = lines[0]

    for (let i = lines.length; i >= 1; i--) {
      let line = lines[i]
      if (line) {
        line.remove()
      }
    }

    let editable = firstLine.querySelector(".line__editable")
    let output = firstLine.querySelector(".line__output")
    editable.setAttribute("contenteditable", "true")
    editable.textContent = ""
    output.textContent = ""
    editable.focus()
  }

  onKeydown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.removeAttribute("contenteditable")
      e.currentTarget.removeAttribute("autofocus")
      let input = e.currentTarget.innerText;
      let program = Parser.from(Lexer.from(input)).parseProgram()
      let result = evalProgram(program)
      let line = e.currentTarget.closest(".line")
      let output = line.querySelector(".line__output")
      output.textContent = result
      this.renderPrompt(this.addPrompt(), true)
    } else if (e.ctrlKey && e.key === "l") {
      this.clearPrompts()
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
