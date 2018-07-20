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
    activeIndex: 0,
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

    ipcRenderer.on('save-file', event => {
      this.saveFile();
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
      const filesData = filteredFiles.map(file => {
        const date = file.substr(
          file.indexOf('_') + 1,
          file.indexOf('.') - file.indexOf('_') - 1
        );
        return {
          date,
          path: `${directory}/${file}`,
          title: file.substr(0, file.indexOf('_'))
        }
    });

      this.setState(
        {
          filesData
        }, () => this.loadFile(0)
      );
    });
  }

  loadFile = index => {
    const { filesData } = this.state;
    const content = fs.readFileSync(filesData[index].path).toString();

    this.setState({
      loadedFile: content,
      activeIndex: index
    });
  }

  changeFile = index => () => {
    const { activeIndex } = this.state;
    if (index !== activeIndex) {
      this.saveFile();
      this.loadFile(index);
    }
  }

  saveFile = () => {
    const { activeIndex, loadedFile, filesData } = this.state;
    fs.writeFile(filesData[activeIndex].path, loadedFile, err => {
      if (err) return console.log(err);
    });
  }

  render() {
    const { activeIndex, filesData, directory, loadedFile } = this.state;
    return (
      <AppWrap>
        <Header>Journal</Header>
        {directory ? (
          <Split>
            <FilesWindow>
              {filesData.map((file, index) => (
                <FileButton
                  onClick={this.changeFile(index)}
                  active={activeIndex === index}
                >
                  <p className="title">
                    {file.title}
                  </p>
                  <p className="date">
                    {file.date}
                  </p>
                </FileButton>
              ))}
            </FilesWindow>
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
                value={loadedFile}
              />
            </CodeWindow>
            <RenderedWindow>
              <Markdown>{loadedFile}</Markdown>
            </RenderedWindow>
          </Split>
        ) : (
          <LoadingMessage>
            <LoadingButton>
              <h1>Open a folder to get started</h1>
            </LoadingButton>
          </LoadingMessage>
        )}
      </AppWrap>
    );
  }
}

export default App;

const colors = {
  blue: '#29485b',
  lightBlue: '#607C8D',
  darkBlue: '#18384B',
  altBlue: '#3F5F73',
  altDarkBlue: '#082333',
  red: '#BD2B5C',
  teal: '#1bb398',
  gray: '#d8d8d8'
};

const AppWrap = styled.div`
  margin-top: 23px;
`;

const Header = styled.header`
  background-color: ${colors.darkBlue};
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
  min-height: calc(100vh - 23px);
`;

const CodeWindow = styled.div`
  flex: 1;
  padding-top: 2rem;
  background-color: ${colors.blue};
`;

const FilesWindow = styled.div`
  background: ${colors.darkBlue};
  border-right: 1px solid ${colors.altBlue};
  position: relative;
  width: 20%;
  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1) inset;
  }
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

  ul {
    list-style: none;
  }

  ul > li::before {
    content: "•";
    color: ${colors.red};
    margin-right: 8px;
  }
`;

const FileButton = styled.button`
  padding: 10px;
  width: 100%;
  background: ${colors.altDarkBlue};
  opacity: 0.4;
  text-align: left;
  color: #fff;
  border: none;
  border-bottom: solid 1px ${colors.blue};
  transition: 0.3s ease all;
  &:hover {
    opacity: 1;
    border-left: solid 4px ${colors.red};
  }
  &:focus {
    outline: none;
  }
  ${({ active }) => active && `
    opacity: 1;
    border-left: solid 4px ${colors.red};
  `}

  .title {
    font-weight: bold;
    font-size: 0.9rem;
    margin: 0 0 5px;
  }

  .date {
    margin: 0;
  }
`;
