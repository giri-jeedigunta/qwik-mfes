import {
	component$,
	SSRStream,
	SSRStreamBlock,
	StreamWriter,
} from '@builder.io/qwik';

export interface Props {
	url: string;
}

export default component$(({ url }: Props) => {
	return (
		<div class="remote-component">
			<SSRStreamBlock>
				<SSRStream>{getSSRStreamFunction(url)}</SSRStream>
			</SSRStreamBlock>
		</div>
	);
});

export function fetchRemote(url: string): Promise<Response> {
	return fetch(url, { headers: { accept: 'text/html' } });
}

export function getSSRStreamFunction(remoteUrl: string) {
	const decoder = new TextDecoder();

	return async (stream: StreamWriter) => {
		const reader = (await fetchRemote(remoteUrl)).body!.getReader();
		let fragmentChunk = await reader.read();
		let base = '';
		while (!fragmentChunk.done) {
			const rawHtml = decoder.decode(fragmentChunk.value);
			const fixedHtmlObj = fixRemoteHTMLInDevMode(rawHtml, base);
			base = fixedHtmlObj.base;
			stream.write(fixedHtmlObj.html);
			fragmentChunk = await reader.read();
		}
	};
}

/**
 * This function is a hack to work around the fact that in dev mode the remote html is failing to prefix the base path.
 */
export function fixRemoteHTMLInDevMode(rawHtml: string, base = ''): { html: string; base: string } {
	
	let html = rawHtml;
	const dev = true;

	if (dev) {
		html = html.replace(/q:base="\/(\w+)\/build\/"/gm, (match, child) => {
			base = '/' + child;
			console.log('FOUND', base);
			return match;
		});
		html = html.replace(/="(\/src\/([^"]+))"/gm, (match, path) => {
			console.log('REPLACE', path);
			return '="' + base + path + '"';
		});
		html = html.replace(/"\\u0002(\/src\/([^"]+))"/gm, (match, path) => {
			console.log('REPLACE', path);
			return '"\\u0002' + base + path + '"';
		});
	}

	return { html, base };
}
