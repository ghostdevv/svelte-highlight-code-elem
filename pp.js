import MagicString from 'magic-string';
import { parse } from 'svelte/compiler';
import { walk } from 'zimmerframe';
import { codeToHtml } from 'shiki';
import dedent from 'dedent';

/** @returns {import('svelte/compiler').PreprocessorGroup} */
export function svelte_highlight_code_elem() {
	return {
		name: 'test_pp',
		async markup({ content, filename }) {
			const ast = parse(content, { filename });
			const s = new MagicString(content);

			/** @type {Promise<any>[]} */
			const to_process = [];

			/**
			 * @param {number} start
			 * @param {number} end
			 * @param {string} code
			 * @param {string} lang
			 */
			async function highlight(start, end, code, lang) {
				const highlighted_code = await codeToHtml(code, {
					theme: 'vitesse-dark',
					lang,
				});

				s.update(
					start,
					end,
					highlighted_code
						.replace(/\{/g, '&lbrace;')
						.replace(/\}/g, '&rbrace;'),
				);
			}

			walk(ast.html, null, {
				Element({ name, attributes, start, end, children }, { next }) {
					if (name == 'code') {
						const lang = attributes
							.find((a) => a.name == 'lang')
							?.value?.at(0)
							?.data?.trim();

						if (typeof lang != 'string' || lang.length == 0) {
							return;
						}

						const code = dedent(
							s.slice(children.at(0).start, children.at(-1).end),
						);

						to_process.push(highlight(start, end, code, lang));
					} else {
						next();
					}
				},
			});

			await Promise.all(to_process);

			return {
				code: s.toString(),
				map: s.generateMap(),
			};
		},
	};
}
