import { asyncWalk } from 'estree-walker';
import { fileURLToPath } from 'node:url';
import { parse } from 'svelte/compiler';
import MagicString from 'magic-string';
import { dirname } from 'node:path';
import { codeToHtml } from 'shiki';
import dedent from 'dedent';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CODE_CMP_PATH = `${__dirname}/Code.svelte`;
const MARKER_COMMENT = '<!-- __shce_processed_uc__ -->';
const CODE_CMP_NAME = 'Code_shce';

/**
 * @param {any[]=} attributes
 * @param {string} name
 * @returns {string | null}
 */
function get_attrib(attributes, name) {
	const value = attributes?.find((a) => a.name == name)?.value;

	return typeof value == 'undefined'
		? null
		: typeof value == 'boolean'
		? value
		: value?.at(0)?.data?.trim() ?? null;
}

/**
 *
 * @param {import('svelte/compiler').AST.Root} ast
 * @param {(node: any, lang: string) => Promise<void>} cb
 */
async function find_code(ast, cb) {
	await asyncWalk(ast.fragment, {
		async enter(node) {
			const { name, attributes } = node;

			if (name == 'code') {
				const lang = get_attrib(attributes, 'lang');

				if (typeof lang != 'string' || lang.length == 0) {
					return;
				}

				this.skip();

				await cb(node, lang);
			}
		},
	});
}

/** @returns {import('svelte/compiler').PreprocessorGroup} */
export function svelte_highlight_code_elem() {
	return {
		name: 'svelte_highlight_code_elem',
		async script({ content, markup }) {
			if (markup.includes(MARKER_COMMENT)) {
				const s = new MagicString(content);

				s.prepend(
					`import ${CODE_CMP_NAME} from '${DEFAULT_CODE_CMP_PATH}';`,
				);

				return {
					code: s.toString(),
					map: s.generateMap(),
				};
			}

			return null;
		},
		async markup({ content, filename }) {
			const ast = parse(content, { filename, modern: true });
			const s = new MagicString(content);

			await find_code(ast, async (node, lang) => {
				const { attributes, start, end, fragment } = node;
				const inline = get_attrib(attributes, 'inline') ?? false;

				const code = dedent(
					s.slice(
						fragment.nodes.at(0).start,
						fragment.nodes.at(-1).end,
					),
				);

				const highlighted_code = await codeToHtml(code, {
					theme: 'vitesse-dark',
					lang,
				});

				const replacement = inline
					? `{@html ${JSON.stringify(highlighted_code)}}`
					: // prettier-ignore
					  `${MARKER_COMMENT}\n<${CODE_CMP_NAME} code={${JSON.stringify(highlighted_code)}}></${CODE_CMP_NAME}>`;

				s.update(start, end, replacement);
			});

			return s.hasChanged()
				? { code: s.toString(), map: s.generateMap() }
				: null;
		},
	};
}
