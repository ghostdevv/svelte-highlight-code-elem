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
			const ast = parse(content, { filename, modern: true });
			const s = new MagicString(content);

			ast.fragment.nodes;

			await asyncWalk(ast.fragment, {
				async enter(node) {
					const { name, attributes, start, end, fragment } = node;

					if (name == 'code') {
						const lang = attributes
							.find((a) => a.name == 'lang')
							?.value?.at(0)
							?.data?.trim();

						if (typeof lang != 'string' || lang.length == 0) {
							return;
						}

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

						s.update(
							start,
							end,
							`{@html ${JSON.stringify(highlighted_code)}}`,
						);

						this.skip();
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
