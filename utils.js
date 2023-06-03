export function cd(fs) {
  return (args, env) => {
    if (env.stdin) {
      return fs.goto(env.stdin)
    }
    let p = args.map(arg => arg.value).join("")
    return fs.goto(p)
  }
}

export function ls(fs) {
  return (args, env) => {
    return fs.print()
  }
}

export function echo(fs) {
  return (args, env) => {
    return args.map(arg => arg.value).join(" ")
  }
}

export function count(fs) {
  return (args, env) => {
    return env?.stdin?.length
  }
}

export function touch(fs) {
  return (args, env) => {
    if (!args.length) {
      return "missing operand"
    }
    let names = args.map(arg => arg.value)
    return fs.createFile(names)
  }
}

export function mkdir(fs) {
  return (args, env) => {
    if (!args.length) {
      return "missing operand"
    }

    let names = args.map(arg => arg.value)
    return fs.createFolder(names)
  }
}

export function rm(fs) {
  return (args, env) => {
    let options = {}

    while (args[0]?.value === "-") {
      args.shift()
      let next = args.shift()
      for (let i = 0; i < next?.value.length; i++) {
        let ch = next.value[i]
        if (ch === "r") {
          options.recursive = true
        }
        if (ch === "f") {
          options.force = true
        }
      }
    }

    if (!args.length) {
      return "missing operand"
    }
    return fs.remove(args.map(arg => arg.value), options)
  }
}
