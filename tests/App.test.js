import { render } from '@testing-library/react';
import HelloWorld from 'components/HelloWorld';

describe('HelloWorld', () => {
	it('should render', () => {
		const { container } = render(<HelloWorld />);

		expect(container).toMatchSnapshot();
	});
});
