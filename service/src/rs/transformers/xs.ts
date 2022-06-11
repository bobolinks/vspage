/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import ts from 'typescript';
import { lookupModule } from '../lookup';

export type TyVisitorFunc = (factory: ts.NodeFactory, node: ts.Node) => ts.Node | undefined;

function isExportDefault(node: ts.Declaration): boolean {
  if ((node as any).symbol?.escapedName === 'default') {
    return true;
  }
  const modifier = ts.ModifierFlags.ExportDefault;
  return (ts.getCombinedModifierFlags(node) & modifier) === modifier;
}

function requireToImport(factory: ts.NodeFactory, nodes: any[], expr: ts.CallExpression, impAppend: string, decl?: ts.VariableDeclaration): ts.ImportDeclaration {
  const { name } = decl || {};
  const fileName = (expr.arguments[0] as any).text;
  const spec = factory.createStringLiteral(`${fileName}${impAppend}`);
  if (name && decl && ts.isObjectBindingPattern(name)) {
    const nameFmt = name.getText().replace(/[^0-9a-z]/ig, '_');
    const cause = factory.createImportClause(false, factory.createIdentifier(nameFmt), undefined);
    const newNode = factory.createImportDeclaration(undefined, undefined, cause, spec);
    nodes.push(newNode);
    const newDecl = factory.createVariableDeclaration(decl.name, decl.exclamationToken, undefined, factory.createIdentifier(nameFmt));
    const newDels = factory.createVariableDeclarationList([newDecl]);
    const newStmt = factory.createVariableStatement(undefined, newDels);
    nodes.push(newStmt);
    return newNode;
  }
  const cause = name ? factory.createImportClause(false, factory.createIdentifier(name.getText()), undefined) : undefined;
  const newNode = factory.createImportDeclaration(undefined, undefined, cause, spec);
  nodes.push(newNode);
  return newNode;
}

export default function (prjPath: string, filePath: string, code: string, importType?: string, prefixCode?: string): string {
  const impAppend = importType === 'module' ? '?import=module' : '';
  let hasExported = false;
  let hasDefaultExported = false;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const { factory } = context;
    let level = 0;
    return (sourceFile) => {
      const nodes: any = [];
      const visitor: ts.Visitor = function (this: any, node: ts.Node): ts.Node {
        if (ts.isExportAssignment(node)) {
          hasExported = true;
          if (isExportDefault(node)) {
            hasDefaultExported = true;
          }
        } else if (ts.isFunctionDeclaration(node) && isExportDefault(node)) {
          hasExported = true;
          hasDefaultExported = true;
        } else if (ts.isClassDeclaration(node) && isExportDefault(node)) {
          hasExported = true;
          hasDefaultExported = true;
        } else if (ts.isExportDeclaration(node)) {
          hasExported = true;
        }
        if (ts.isCallExpression(node)) {
          if ((node as any).expression.text === 'require') {
            return requireToImport(factory, nodes, node, impAppend);
          }
        } else if (ts.isExpressionStatement(node)) {
          const stmt = node as ts.ExpressionStatement;
          const expr = stmt.expression as ts.CallExpression;
          if (ts.isCallExpression(expr)) {
            if ((expr as any).expression.text === 'require') {
              return requireToImport(factory, nodes, expr, impAppend);
            }
          }
        } else if (ts.isVariableStatement(node)) {
          const stmt = node as ts.VariableStatement;
          const decls = stmt.declarationList.declarations;
          if (decls.length === 1 && decls[0].initializer) {
            if (ts.isCallExpression(decls[0].initializer)) {
              const decl = decls[0] as ts.VariableDeclaration;
              const expr = decl.initializer as ts.CallExpression;
              if ((expr as any).expression.text === 'require') {
                return requireToImport(factory, nodes, expr, impAppend, decl);
              }
            }
          }
        } else if (ts.isImportDeclaration(node)) {
          const fileName = (node as any).moduleSpecifier.text;
          if (/^@\//.test(fileName)) {
            const spec = factory.createStringLiteral(`/src/${fileName.substring(2)}${impAppend}`);
            const newNode = factory.createImportDeclaration(node.decorators, node.modifiers, node.importClause, spec);
            nodes.push(newNode);
            return newNode;
          } if (/^[^./]/.test(fileName)) {
            const newPath = lookupModule(prjPath, fileName);
            if (newPath === undefined) {
              if (node.importClause?.name) {
                // create an variable statement
                const emptyObject = factory.createObjectLiteralExpression();
                const newDecl = factory.createVariableDeclaration(node.importClause.name, undefined, undefined, emptyObject);
                const newDels = factory.createVariableDeclarationList([newDecl]);
                const newNode = factory.createVariableStatement(undefined, newDels);
                nodes.push(newNode);
              }
            } else if (newPath !== fileName) {
              const spec = factory.createStringLiteral(`${newPath}${impAppend}`);
              const newNode = factory.createImportDeclaration(node.decorators, node.modifiers, node.importClause, spec);
              nodes.push(newNode);
              return newNode;
            }
          } else if (!/\.(css|wxss)$/.test(fileName)) {
            const spec = factory.createStringLiteral(`${fileName}${impAppend}`);
            const newNode = factory.createImportDeclaration(node.decorators, node.modifiers, node.importClause, spec);
            nodes.push(newNode);
            return newNode;
          }
        } else if (ts.isExportDeclaration(node)) {
          if (node.moduleSpecifier) {
            const fileName = (node as any).moduleSpecifier.text;
            if (/^@\//.test(fileName)) {
              const spec = factory.createStringLiteral(`/src/${fileName.substring(2)}${impAppend}`);
              const newNode = factory.createExportDeclaration(node.decorators, node.modifiers, node.isTypeOnly, node.exportClause, spec);
              nodes.push(newNode);
              return newNode;
            } if (/^[^./]/.test(fileName)) {
              const newPath = lookupModule(prjPath, fileName);
              if (newPath && newPath !== fileName) {
                const spec = factory.createStringLiteral(`${newPath}${impAppend}`);
                const newNode = factory.createExportDeclaration(node.decorators, node.modifiers, node.isTypeOnly, node.exportClause, spec);
                nodes.push(newNode);
                return newNode;
              }
            } if (impAppend) {
              const spec = factory.createStringLiteral(`${fileName}${impAppend}`);
              const newNode = factory.createExportDeclaration(node.decorators, node.modifiers, node.isTypeOnly, node.exportClause, spec);
              nodes.push(newNode);
              return newNode;
            }
          }
        }

        if (level === 1) {
          nodes.push(node);
          return node;
        }
        level++;
        const rs = ts.visitEachChild(node, visitor, context);
        level--;
        return rs;
      };

      ts.visitNode(sourceFile, visitor);
      return factory.updateSourceFile(sourceFile, nodes);
    };
  };

  if (/\.ts$/i.test(filePath)) {
    // tranform to js first
    const rs = ts.transpileModule(code, {
      compilerOptions: {
        alwaysStrict: false,
        inlineSourceMap: false,
        target: ts.ScriptTarget.ESNext,
      },
    });
    if (rs) {
      code = rs.outputText || code;
    }
  }

  // `const {a,b} = require("asd");`
  const transformers = [transformer];
  let src = ts.transpileModule(code, {
    transformers: {
      before: transformers,
    },
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
  }).outputText;

  if (importType === 'module') {
    if (!hasExported) {
      src = `var exports = {};\nvar module = {exports};\n${src}\nexport default exports.default || module.exports;\n`;
    } else if (!hasDefaultExported) {
      src = `var exports = {};\nvar module = {exports};\n${src}\nexport default module.exports;\n`;
    }
  }

  return `${prefixCode || ''}${prefixCode ? ';\n' : ''}${src}`;
}
