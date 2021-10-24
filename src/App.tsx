import React from 'react';
import {main} from './contentscript'

class App extends React.Component {

  constructor(props) {
  
    super(props);


    this.state = {
      copySuccess: "",
      gitBranchName: "",
    };

    this.setGitBranchName = this.setGitBranchName.bind(this);

  }

  async setGitBranchName() {
    const DOMAIN_NAME = "jira.sharethemeal.org";
    const result = await main(DOMAIN_NAME).then((r) => r)
    this.setState({
      gitBranchName: result
    });
  }

  copyToClipboard = (e) => {
    this.textArea.select();
    document.execCommand('copy');
    e.target.focus();
    this.setState({ copySuccess: 'Copied!' });
  };

  render() {
    return (
      <div>
        {
         document.queryCommandSupported('copy') &&
          <div>
            <button onClick={this.copyToClipboard}>Copy</button> 
            {this.state.copySuccess}
          </div>
        }
        <form>
          <textarea
            ref={(textarea) => this.textArea = textarea}
            value={this.setGitBranchName}             
            />
        </form>
      </div>
    );
  }

}


export default App;


