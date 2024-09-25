import { asyncWalk } from 'estree-walker';
import { parse } from 'svelte/compiler';
import MagicString from 'magic-string';
import { codeToHtml } from 'shiki';
import dedent from 'dedent';

/** @returns {import('svelte/compiler').PreprocessorGroup} */
export function svelte_highlight_code_elem() {
	return {
		name: 'svelte_highlight_code_elem',
		async markup({ content, filename }) {
			const ast = parse(content, { filename });
			const s = new MagicString(content);

			await asyncWalk(ast.html, {
				async enter({ name, attributes, start, end, children }) {
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

						const highlighted_code = await codeToHtml(code, {
							theme: 'vitesse-dark',
							lang,
						});

						s.update(
							start,
							end,
							`{@html ${JSON.stringify(highlighted_code)}}`,
						);
					}
				},
			});

			return {
				code: s.toString(),
				map: s.generateMap(),
			};
		},
	};
}
