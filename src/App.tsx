import React, { useState, useEffect, useRef } from 'react';
import { main } from './contentscript';

// With functional component
// function App() {
//   const [gitBranchName, setGitBranchName] = useState('');
//   const [copySuccess, setCopySuccess] = useState('');

//   const textAreaRef = useRef(null);

//   useEffect(() => {
//     const getBranchName = async () => {
//       const DOMAIN_NAME = 'jira.sharethemeal.org';
//       const result = await main(DOMAIN_NAME);
//       setGitBranchName(result);
//     };

//     getBranchName();
//   }, []);

//   const copyToClipboard = (e) => {
//     textAreaRef.current.select();
//     document.execCommand('copy');
//     e.target.focus();
//     setCopySuccess('Copied!');
//   };

//   return (
//     <div>
//       {document.queryCommandSupported('copy') && (
//         <div>
//           <button onClick={(e) => copyToClipboard(e)}>Copy</button>
//           {copySuccess}
//         </div>
//       )}
//       <form>
//         <textarea ref={textAreaRef} value={gitBranchName} />
//       </form>
//     </div>
//   );
// }

// with componentDidMount
class App extends React.Component {
  state = {
    copySuccess: '',
    gitBranchName: ''
  };

  // Don't use `any`, should properly type this!
  textAreaRef = React.createRef<any>();

  async componentDidMount() {
    await this.setGitBranchName();
  }

  async setGitBranchName() {
    const DOMAIN_NAME = 'jira.sharethemeal.org';
    const result = await main(DOMAIN_NAME);
    this.setState({
      gitBranchName: result
    });
  }

  copyToClipboard = (e) => {
    this.textAreaRef.current.select();
    document.execCommand('copy');
    e.target.focus();
    this.setState({ copySuccess: 'Copied!' });
  };

  render() {
    return (
      <div>
        {document.queryCommandSupported('copy') && (
          <div>
            <button onClick={this.copyToClipboard}>Copy</button>
            {this.state.copySuccess}
          </div>
        )}
        <form>
          <textarea ref={this.textAreaRef} value={this.state.gitBranchName} />
        </form>
      </div>
    );
  }
}

export default App;
