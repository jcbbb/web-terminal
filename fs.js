export class FS {
  constructor() {
    this.map = new Map([[
      "/",
      new Map([
        ["Downloads", new Map([["dow.js", { name: "dow.js" }]])],
        ["Documents", new Map([["doc.js", { name: "doc.js" }]])]
      ])
    ]])
  }

  print(path = "") {
    let found = this.find(path)
    if (found) {
      let str = ""
      let keys = found.keys()
      for (let key of keys) {
        str += `${key}\t`
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
