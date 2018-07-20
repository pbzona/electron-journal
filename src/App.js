import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import styled from 'styled-components';

// Import editor and some dependencies
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/markdown';
import 'brace/theme/dracula';

import './App.css';

const settings = window.require('electron-settings');
const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');

class App extends Component {
  state = {
    loadedFile: '',
    directory: settings.get('directory') || null,
    filesData: []
  };

  constructor() {
    super();

    // Load files from directory on app startup
    const directory = settings.get('directory');
    if (directory) {
      this.loadAndReadFiles(directory);
    }

    ipcRenderer.on('new-file', (event, fileContent) => {
      this.setState({
        loadedFile: fileContent
      });
    });

    ipcRenderer.on('new-dir', (event, directory) => {
      this.setState({
        directory
      });
      settings.set('directory', directory);
      this.loadAndReadFiles(directory);
    });
  }

  loadAndReadFiles = directory => {
    fs.readdir(directory, (err, files) => {
      const filteredFiles = files.filter(file => {
        const ext = path.extname(file);
        return ext === '.md' || ext === '.markdown' || ext === '.txt';
      });
      const filesData = filteredFiles.map(file => ({
        path: `${directory}/${file}`
      }));

      this.setState({
        filesData
      });
    });
  }

  render() {
    return (
      <div className="App">
        <Header>Journal</Header>
        {this.state.directory ? (
          <Split>
            <div>
              {this.state.filesData.map(file => <h1>{file.path}</h1>)}
            </div>
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
        ) : (
          <LoadingMessage>
            <LoadingButton>
              <h1>Open a folder to get started</h1>
            </LoadingButton>
          </LoadingMessage>
        )}
      </div>
    );
  }
}

export default App;

const colors = {
  blue: '#29485b',
  lightBlue: '#607C8D',
  darkBlue: '#18384B',
  red: '#BD2B5C',
  teal: '#1bb398',
  gray: '#d8d8d8'
};

const Header = styled.header`
  background-color: ${colors.blue};
  color: ${colors.lightBlue};
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

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.blue};
  min-height: 100vh;
`;

const LoadingButton = styled.button`
  padding: 10px 30px;
  background-color: ${colors.darkBlue};
  color: ${colors.lightBlue};
  border: none;
`;

const Split = styled.div`
  display: flex;
  min-height: 100vh;
`;

const CodeWindow = styled.div`
  flex: 1;
  padding-top: 2rem;
  background-color: ${colors.blue};
`;

const RenderedWindow = styled.div`
  background-color: ${colors.blue};
  width: 35%;
  padding: 20px;
  color: ${colors.gray};
  border-left: 1px solid ${colors.darkBlue};

  h1, h2, h3, h4, h5, h6 {
    color: #fff;
  };

  h1 {
    border-bottom: solid 3px ${colors.teal};
    padding-bottom: 10px;
  };

  h2 {
    border-bottom: solid 1px ${colors.red};
    padding-bottom: 10px;
  };

  a {
    color: ${colors.teal};
  }

  ul, ol {
    list-style: none;
  }

  li::before {
    content: "•";
    color: ${colors.red};
    margin-right: 8px;
  }
`;
