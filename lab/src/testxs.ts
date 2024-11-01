import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';
import xs from './transformers/xs';

// const root = '/Users/amos/Projects/kids/app';
// const file = path.join(root, 'src/libs/index.ts');
// const code = fs.readFileSync(file, 'utf-8');
// const out = xs(root, file, code, 'module');
// console.log(out);

const b = path.dirname('/a/b/c.js');
const s = path.relative(b, '/a/b/d.js');
debugger;

// 自定义转换器
function createCustomTransformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  return (sourceFile: ts.SourceFile) => {
    function visitNode(node: ts.Node): ts.Node {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
        if (moduleSpecifier.text === 'a') {
          // 创建新的 import 声明
          const newModuleSpecifier = ts.factory.createStringLiteral('../lib/a.js');
          return ts.factory.createImportDeclaration(
            node.modifiers,
            node.importClause,
            newModuleSpecifier,
            node.assertClause
          );
        }
      }
      return ts.visitEachChild(node, visitNode, context);
    }

    return ts.visitNode(sourceFile, visitNode);
  };
}

// 使用自定义转换器
// const sourceFile = ts.createSourceFile('index.ts', 'import A from \'a\';', ts.ScriptTarget.ESNext, undefined, ts.ScriptKind.TS);
let src = ts.transpileModule('import A from \'a\';', {
  transformers: {
    before: [createCustomTransformer],
  },
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
  },
}).outputText;

console.log(src);

debugger;