import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';

// Import editor and some dependencies
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/markdown';
import 'brace/theme/dracula';

import './App.css';

const { ipcRenderer } = window.require('electron');

class App extends Component {
  state = {
    loadedFile: '',
    directory: ''
  }

  constructor() {
    super();

    ipcRenderer.on('new-file', (event, fileContent) => {
      this.setState({
        loadedFile: fileContent
      });
    });

    ipcRenderer.on('new-dir', (event, filePaths, dir) => {
      this.setState({
        directory: dir
      });
    });
  }

  render() {
    return (
      <div className="App">
        <Header>Journal</Header>
        <Split>
          <CodeWindow>
            <AceEditor
              mode="markdown"
              theme="dracula"
              onChange={newContent => {
                this.setState({
                  loadedFile: newContent
                });
              }}
              name="markdown_editor"
              value={this.state.loadedFile}
            />
          </CodeWindow>
          <RenderedWindow>
            <Markdown>{this.state.loadedFile}</Markdown>
          </RenderedWindow>
        </Split>
      </div>
    );
  }
}

export default App;

const Header = styled.header`
  background-color: #29485b;
  color: #607C8D;
  font-size: 0.8rem;
  height: 23px;
  text-align: center;
  position: fixed;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.2);
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Split = styled.div`
  display: flex;
  min-height: 100vh;
`;

const CodeWindow = styled.div`
  flex: 1;
  padding-top: 2rem;
  background-color: #29485b;
`;

const RenderedWindow = styled.div`
  background-color: #29485b;
  width: 35%;
  padding: 20px;
  color: #d8d8d8;
  border-left: 1px solid #302b3a;

  h1, h2, h3, h4, h5, h6 {
    color: #fff;
  };

  h1 {
    border-bottom: solid 3px #1bb398;
    padding-bottom: 10px;
  };

  a {
    color: #1bb398;
  }

  ul, ol {
    list-style: none;
  }

  li::before {
    content: "•";
    color: #BD2B5C;
    margin-right: 8px;
  }
`;
