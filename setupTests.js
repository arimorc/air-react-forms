/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme';
// TODO: move to the official adapter once it is available
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });
