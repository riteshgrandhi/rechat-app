import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";

interface IHomeProps extends RouteComponentProps {}
interface IHomeState {
  marcs: { id: string }[];
}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  /**
   *
   */
  constructor(props: IHomeProps) {
    super(props);
    this.getMarcs = this.getMarcs.bind(this);
    this.state = {
      marcs: []
    };
  }

  public componentDidMount() {
    this.getMarcs().then(resp => {
      console.log(resp);
      this.setState({ marcs: resp.data });
    });
  }

  private async getMarcs() {
    try {
      return await fetch("/api/marcs").then(res => res.json());
    } catch (ex) {
      throw `Failed to fetch: ${ex}`;
    }
  }

  render() {
    return (
      <div>
        {this.state.marcs.map(m => (
          <div>
            <button
              onClick={() => {
                navigate("/edit/" + m.id);
              }}
            >
              Edit Marc {m.id}
            </button>
          </div>
        ))}
      </div>
    );
  }
}
