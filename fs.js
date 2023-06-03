export class FS {
  constructor() {
    this.fullPath = "/"
    this.currentDir = ""
    this.map = new Map([[
      "/",
      new Map([
        ["Downloads", new Map([["dow.js", { name: "dow.js" }]])],
        ["Documents", new Map([["doc.js", { name: "doc.js" }]])],
        ["Desktop", new Map([
          ["what", new Map([["what", { name: "what" }]])],
          ["desktop.js", { name: "desktop.js" }]
        ])]
      ])
    ]])
  }

  getCurrentDir() {
    return this.currentDir
  }

  goto(name) {
    if (name === "..") {
      let parts = this.fullPath.split("/").filter(Boolean)
      parts.pop()
      this.fullPath = parts.join("/")
      this.currentDir = parts[parts.length - 1]
      return
    }

    let found = this.find(this.fullPath + `/${name}`)
    if (!found) {
      return `no such file or directory: ${name}`
    }

    if (!(found instanceof Map)) {
      return `not a directory: ${name}`
    }

    this.fullPath += `/${name}`
    this.currentDir = name
  }

  print(path = this.fullPath) {
    let found = this.find(path)
    if (found) {
      let str = ""
      for (let [key, value] of found.entries()) {
        if (value instanceof Map) {
          str += `<span class="keyword">${key}</span>&emsp;`
        } else {
          str += `${key}&emsp;`
        }
      }
      return str
    }
  }

  remove(names, options) {
    let found = this.find(this.fullPath)
    if (found) {
      for (let name of names) {
        let file = found.get(name)
        if (!file) return `file not found: ${name}`
        if (file instanceof Map) {
          // this is folder
          if (file.size > 0 && !options.recursive) {
            return `directory not empty: ${name}`
          } else {
            found.delete(name)
          }
        } else {
          found.delete(name)
        }
      }
    }
  }

  createFolder(names) {
    let found = this.find(this.currentDir)
    if (found) {
      for (let name of names) {
        if (found.has(name)) {
          return `directory already exists: ${name}`
        }
        found.set(name, new Map())
      }
    }
  }

  createFile(names) {
    let found = this.find(this.currentDir)

    if (found) {
      for (let name of names) {
        if (found.has(name)) {
          return `file already exists: ${name}`
        }
        found.set(name, { name })
      }
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
      if (p) {
        if (found) found = found.get(p)
        else found = root.get(p)
      }
    }

    return found
  }
}

