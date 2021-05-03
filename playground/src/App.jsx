import AdvancedForm from './AdvancedForm';
import SimpleForm from './SimpleForm';

/**
 * @name App
 * @description Entrypoint of the playground
 *
 * @author Yann Hodiesne
 */
const App = () => (
	<>
		<h1>air-react-forms</h1>
		<SimpleForm />
		<AdvancedForm />
	</>
);

export default App;
