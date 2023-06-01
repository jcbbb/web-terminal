export class FS {
  constructor() {
    this.currentDir = "/"
    this.map = new Map([[
      "/",
      new Map([
        ["Downloads", new Map([["dow.js", { name: "dow.js" }]])],
        ["Documents", new Map([["doc.js", { name: "doc.js" }]])],
        ["Desktop", new Map([["desktop.js", { name: "desktop.js" }]])]
      ])
    ]])
  }

  goto(name) {
    if (name === "..") {
      let parts = this.currentDir.split("/")
      this.currentDir = parts.filter((p, i) => i !== parts.length - 1 && !p).join("/")
      return ""
    }

    let exists = this.find(name)
    if (!exists) {
      return `no such file or directory: ${name}`
    }

    this.currentDir += name
    return ""
  }

  print(path = this.currentDir) {
    let found = this.find(path)
    if (found) {
      let str = ""
      let keys = found.keys()
      for (let key of keys) {
        str += `${key}&emsp;`
      }
      return str
    }
  }

  find(path = "", base = "/") {
    let root = this.map.get(base)
    if (!root) return
    let parts = path.split("/").filter(Boolean)
    if (!parts.length) return root

    let found = undefined
    while (parts.length) {
      let p = parts.shift()
      if (p) found = root.get(p)
    }

    return found
  }
}
