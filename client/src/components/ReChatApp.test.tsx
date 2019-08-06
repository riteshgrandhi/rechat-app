import React from 'react';
import ReactDOM from 'react-dom';
import ReChatApp from './ReChatApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ReChatApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
