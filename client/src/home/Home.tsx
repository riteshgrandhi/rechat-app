import React, { Fragment } from "react";
import { RouteComponentProps } from "@reach/router";
import styles from "./../styles/app.module.scss";
import { SideBar } from "./SideBar";
import { IMarc, IDataResponse, LogLevel } from "@common";
import Editor from "./Editor";
import ServiceContext from "../services/ServiceContext";

interface IHomeProps extends RouteComponentProps<{ currentMarcId: string }> {
  marcs: IMarc[];
}
interface IHomeState {
  marcs: IMarc[];
}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  static contextType = ServiceContext;
  public context!: React.ContextType<typeof ServiceContext>;

  constructor(props: IHomeProps) {
    super(props);
    this.state = { marcs: props.marcs };

    this.getMarcs = this.getMarcs.bind(this);
    this.refreshMarcs = this.refreshMarcs.bind(this);
  }

  public componentDidMount() {
    this.refreshMarcs();
  }

  private async refreshMarcs() {
    try {
      let marcs: IMarc[] = await this.getMarcs();
      this.setState({ marcs: marcs });
    } catch (err) {
      this.context.logger.log(Home.name, "Error", LogLevel.ERROR, err);
      throw err;
    }
  }

  private async getMarcs(): Promise<IMarc[]> {
    try {
      let res: IDataResponse<IMarc[]> = await this.context.apiService.axiosAuth
        .get<IDataResponse<IMarc[]>>("/api/marcs")
        .then(r => r.data)
        .catch(err => {
          throw err;
        });
      if (!res.data) {
        throw res.error || "'data' is missing";
      }
      this.context.logger.log(Home.name, "Response", LogLevel.VERBOSE, res);
      return res.data;
    } catch (err) {
      throw `Failed to fetch: ${err}`;
    }
  }

  componentWillReceiveProps(prevProps: IHomeProps) {
    if (prevProps.marcs != this.props.marcs) {
      this.setState({ marcs: this.props.marcs });
    }
  }

  render() {
    return (
      <Fragment>
        <SideBar
          marcs={this.state.marcs}
          refreshCallback={this.refreshMarcs}
          currentMarcId={this.props.currentMarcId}
        />
        {this.props.currentMarcId ? (
          <Editor
            key={this.props.currentMarcId}
            marcId={this.props.currentMarcId}
          />
        ) : (
          <div className={styles.homePage}>
            <div>
              <h2>&nbsp;&nbsp;Select or Create a Marc from the Side Bar!</h2>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
