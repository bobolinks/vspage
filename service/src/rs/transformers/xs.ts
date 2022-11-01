/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
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

export default function (prjPath: string, filePath: string, code: string, importType?: string, prefixCode?: string): string {
  const impAppend = importType === 'module' ? '?import=module' : '';
  let inExportOrImport = false;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const { factory } = context;
    return (sourceFile) => {
      const visitor: ts.Visitor = function (this: any, node: ts.Node): ts.Node {
        if (inExportOrImport && ts.isStringLiteral(node)) {
          inExportOrImport = false;
          const fileName = (node as any).text;
          if (/^@\//.test(fileName)) {
            return factory.createStringLiteral(`/${fileName.substring(2)}${impAppend}`);
          } if (/^[^./]/.test(fileName)) {
            const newPath = lookupModule(prjPath, fileName);
            if (newPath && newPath !== fileName) {
              return factory.createStringLiteral(`${newPath}${impAppend}`);
            }
          } if (impAppend) {
            const np = path.resolve(path.dirname(`/${filePath}`), fileName)
            return factory.createStringLiteral(`${np}${impAppend}`);
          }
          return node;
        }
        if (ts.isExportAssignment(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        } else if (ts.isFunctionDeclaration(node) && isExportDefault(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        } else if (ts.isClassDeclaration(node) && isExportDefault(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        } else if (ts.isExportDeclaration(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        }
        if (ts.isCallExpression(node)) {
          if ((node as any).expression.text === 'require') {
            inExportOrImport = true;
            return ts.visitEachChild(node, visitor, context);
          }
        } else if (ts.isExpressionStatement(node)) {
          const stmt = node as ts.ExpressionStatement;
          const expr = stmt.expression as ts.CallExpression;
          if (ts.isCallExpression(expr)) {
            if ((expr as any).expression.text === 'require') {
              inExportOrImport = true;
              return ts.visitEachChild(node, visitor, context);
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
                inExportOrImport = true;
                return ts.visitEachChild(node, visitor, context);
              }
            }
          }
        } else if (ts.isImportDeclaration(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        } else if (ts.isExportDeclaration(node)) {
          inExportOrImport = true;
          return ts.visitEachChild(node, visitor, context);
        }
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor);
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

  return `${prefixCode || ''}${prefixCode ? ';\n' : ''}${src}`;
}
