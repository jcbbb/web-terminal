import { FS } from "./fs.js";
import { Lexer, Parser, Evaluator } from "./lexer-parser-eval.js";
import { cd, count, echo, ls, mkdir, rm, touch } from "./utils.js";

class Prompt {
  constructor(i, o) {
    this.input = i
    this.output = o
    this.id = "p-" + Math.random().toString(32).slice(2)
  }
}

class Terminal {
  constructor(parent) {
    this.programs = {}
    this.history = []
    this.parent = parent
    this.prompts = []
    this.currentPrompt = undefined
    this.fs = new FS()
    this.evaluator = new Evaluator()

    this.init()
    this.registerProgram("cd", cd(this.fs))
    this.registerProgram("ls", ls(this.fs))
    this.registerProgram("count", count(this.fs))
    this.registerProgram("touch", touch(this.fs))
    this.registerProgram("rm", rm(this.fs))
    this.registerProgram("mkdir", mkdir(this.fs))
    this.registerProgram("echo", echo(this.fs))
  }

  registerProgram(name, func) {
    this.programs[name] = func
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
    let dir = document.createElement("span")

    span.textContent = "~"

    editable.setAttribute("contenteditable", "true");
    editable.setAttribute("id", prompt.id)
    editable.classList.add("line__editable")
    div.classList.add("line__container")
    container.classList.add("line")
    output.classList.add("line__output")
    dir.classList.add("keyword", "line__dir")

    dir.textContent = this.fs.getCurrentDir()

    editable.addEventListener("keydown", this.onKeydown.bind(this));
    //editable.addEventListener("input", onInput)

    div.append(span, dir, editable)
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
      this.currentEditable = e.currentTarget
      let program = Parser.from(Lexer.from(input)).parseProgram()
      let result = this.evaluator.eval(program, { programs: this.programs })
      if (result) {
        let line = e.currentTarget.closest(".line")
        let output = line.querySelector(".line__output")
        output.innerHTML = result
      }

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

new Terminal(document.querySelector(".terminal"))
