import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import RemoteMfe from '../components/mfe/';


export default component$(() => {
	return (
		<main>
			<RemoteMfe url="http://localhost:5000/" />
		</main>
	);
});

export const head: DocumentHead = {
	title: 'Qwik dream Demo',
};
