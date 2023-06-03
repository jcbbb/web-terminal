const PRECEDENCE = {
  LOWEST: 1,
  PREFIX: 2,
  COMMAND: 3,
  PIPE: 4,
}

const PRECEDENCES = {
  "COMMAND": PRECEDENCE.COMMAND,
  "PIPE": PRECEDENCE.PIPE
}

/** Check if character is a letter
  * @param {number} ch - character
  * @returns {boolean}
*/
function isLetter(ch) {
  return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122)
}

/** Check if character is a space
  * @param {number} ch - character
  * @returns {boolean}
*/
function isSpace(ch) {
  return ch === 32 || ch === 10 || ch === 9 || ch === 13 || ch === 160
}

/** Class representing a token */
class Token {
  /** Create a token
    * @param {string} [kind] - kind / type of the token
    * @param {string} [literal] - literal value of the token
    * @param {number} [x] - start position
    * @param {number} [y] - end position
  */
  constructor(kind, literal, x = 0, y = 0) {
    this.kind = kind
    this.literal = literal
    this.x = x
    this.y = y
  }
}

/** Class representing a lexer 
  * @property {string | number} ch - character
  * */
export class Lexer {
  /** Create a lexer
    * @param {string} input - source for lexer  
  */
  constructor(input) {
    this.input = input
    this.ch = 0
    this.pos = 0
    this.nextPos = 0
    this.count = -1
  }

  /** Create a lexer
    * @param {string} input - source for lexer  
  */
  static from(input) {
    let l = new Lexer(input)
    l.eatChar()
    return l
  }

  next() {
    let tok = new Token()
    this.skipWhitespace()

    this.count += 1

    switch (this.ch) {
      case 0:
        tok.kind = "EOF"
        tok.x = this.pos
        tok.y = this.nextPos
        break
      case 123:
        tok.literal = "{"
        tok.x = this.pos
        tok.y = this.nextPos
        tok.kind = "LCURLY"
        break
      case 45:
        tok.literal = "-"
        tok.x = this.pos
        tok.y = this.nextPos
        tok.kind = "MINUS"
        break
      case 125:
        tok.literal = "}"
        tok.x = this.pos
        tok.y = this.nextPos
        tok.kind = "RCURLY"
        break
      case 34:
        tok.x = this.pos + 1
        tok.kind = "STRING"
        tok.literal = this.readString()
        tok.y = this.pos
        break
      case 124:
        tok = new Token("PIPE", "|", this.pos, this.nextPos)
        this.count = -1
        break
      default:
        if (isLetter(this.ch)) {
          tok.x = this.pos
          tok.kind = this.count > 0 ? "SYMBOL" : "COMMAND"
          tok.literal = this.readSymbol()
          tok.y = this.pos
          return tok
        } else {
          tok.kind = "ILLEGAL"
          tok.literal = String.fromCharCode(this.ch)
          tok.x = this.pos
          tok.y = this.nextPos
        }
        break
    }

    this.eatChar()
    return tok
  }

  readString() {
    this.eatChar();
    let pos = this.pos

    while (this.ch !== 34 && this.ch !== 0) {
      this.eatChar()
    }

    return this.input.slice(pos, this.pos)
  }

  readSymbol() {
    let pos = this.pos
    while (isLetter(this.ch)) {
      this.eatChar()
    }

    return this.input.slice(pos, this.pos)
  }

  eatChar() {
    if (this.nextPos >= this.input.length) {
      this.ch = 0
    } else {
      this.ch = this.input[this.nextPos].charCodeAt(0)
    }

    this.pos = this.nextPos
    this.nextPos += 1
  }

  skipWhitespace() {
    while (isSpace(this.ch)) {
      this.eatChar()
    }
  }
}

class AstCommand {
  constructor(token, args) {
    this.token = token
    this.args = args
  }
}

class AstIdentifier {
  constructor(token, value) {
    this.token = token
    this.value = value
  }
}

class AstInfixExpression {
  constructor(token, left, operator, right) {
    this.token = token
    this.left = left
    this.right = right
    this.operator = operator
  }
}

class AstPrefixExpression {
  constructor(token, operator, right) {
    this.token = token
    this.operator = operator
    this.right = right
  }
}

export class Parser {
  constructor(lexer) {
    this.lexer = lexer
    this.curTOken = undefined
    this.nextToken = undefined
    this.prefixFns = {}
    this.infixFns = {}
  }

  static from(lexer) {
    let p = new Parser(lexer)
    p.next()
    p.next()

    p.registerPrefix("IDENTIFIER", p.parseIdentifier.bind(p))
    p.registerPrefix("COMMAND", p.parseCommand.bind(p))
    p.registerInfix("PIPE", p.parseInfixExpression.bind(p))
    //p.registerPrefix("PIPE", p.parsePrefixExpression.bind(p))
    return p
  }

  registerPrefix(kind, fn) {
    this.prefixFns[kind] = fn
  }

  registerInfix(kind, fn) {
    this.infixFns[kind] = fn
  }

  parseIdentifier() {
    return new AstIdentifier(this.curToken, this.curToken.literal)
  }

  parseCommand() {
    return new AstCommand(this.curToken, this.parseArgs())
  }

  parseArgs() {
    let args = []
    if (this.isNextToken("PIPE")) {
      return args
    }

    while (!this.isNextToken("PIPE") && !this.isNextToken("EOF")) {
      this.next()
      args.push({ token: this.curToken, value: this.curToken.literal })
    }

    return args
  }

  parseInfixExpression(left) {
    let expr = new AstInfixExpression(this.curToken, left, this.curToken.literal)

    this.next()
    expr.right = this.parseExpression()

    return expr
  }

  parsePrefixExpression() {
    let expr = new AstPrefixExpression(this.curToken, this.curToken.literal)

    this.next()

    expr.right = this.parseExpression()

    return expr
  }

  parseProgram() {
    let exprs = []
    while (this.curToken.kind !== "EOF") {
      let expr = this.parseExpression()
      exprs.push(expr)
      this.next()
    }

    return exprs
  }

  peekPrecedence() {
    let p = PRECEDENCES[this.nextToken.kind]
    if (p) {
      return p
    }

    return PRECEDENCE.LOWEST
  }

  curPrecedence() {
    let p = PRECEDENCES[this.curToken.kind]
    if (p) {
      return p
    }

    return PRECEDENCE.LOWEST
  }

  parseExpression() {
    let prefix = this.prefixFns[this.curToken.kind]
    if (prefix == null) {
      throw new Error(`no prefix function found for: ${this.curToken.kind}`)
    }

    let leftExp = prefix()

    let infix = this.infixFns[this.nextToken.kind]

    if (infix == null) {
      return leftExp
    }

    this.next()
    leftExp = infix(leftExp)
    return leftExp
  }

  next() {
    this.curToken = this.nextToken
    this.nextToken = this.lexer.next()
  }

  isCurToken(kind) {
    return this.curToken?.kind === kind
  }

  isNextToken(kind) {
    return this.nextToken?.kind === kind
  }

  expectNext(kind) {
    if (this.isNextToken(kind)) {
      this.next()
      return true
    }

    return false
  }
}

export class Evaluator {
  constructor(program = [], env = {}) {
    this.program = program
    this.env = env
  }

  eval(program, env) {
    if (program) {
      this.program = program
    }
    if (env) {
      this.env = env
    }

    let result

    for (let node of program) {
      result = this.evalNode(node, env)
    }

    return result
  }

  evalNode(node, env) {
    if (node instanceof AstCommand) {
      let fn = env.programs[node.token.literal]
      if (fn) {
        return fn(node.args, env)
      }
      return `command not found: ${node.token.literal}`
    }

    if (node instanceof AstInfixExpression) {
      let left = ev(node.left, env)
      let right = ev(node.right, Object.assign(env, { stdin: left }))
      return this.evalInfixExpression(node.operator, left, right)
    }
  }

  evalInfixExpression(operator, left, right) {
    switch (operator) {
      case "|":
        return right
      default:
        return "unsupported operation"
    }
  }
}
