import React from 'react';
import ReactDOM from 'react-dom';
import RemarcApp from './RemarcApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RemarcApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
