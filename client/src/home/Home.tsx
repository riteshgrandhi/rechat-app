import React, { Fragment } from "react";
import { RouteComponentProps, Location } from "@reach/router";
import styles from "./../styles/app.module.scss";
import { SideBar } from "./SideBar";
import { Logger, IMarc, IDataResponse, LogLevel } from "@common";
import ApiService from "../services/ApiService";
import Editor from "./Editor";

interface IHomeProps extends RouteComponentProps<{ currentMarcId: string }> {
  marcs: IMarc[];
  logger: Logger;
  apiService: ApiService;
}
interface IHomeState {
  marcs: IMarc[];
}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  private logger: Logger;
  private apiService: ApiService;

  constructor(props: IHomeProps) {
    super(props);
    this.logger = props.logger;
    this.apiService = props.apiService;
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
      this.logger.log(Home.name, "Error", LogLevel.ERROR, err);
      throw err;
    }
  }

  private async getMarcs(): Promise<IMarc[]> {
    try {
      let res: IDataResponse<IMarc[]> = await this.apiService.axiosAuth
        .get<IDataResponse<IMarc[]>>("/api/marcs")
        .then(r => r.data)
        .catch(err => {
          throw err;
        });
      if (!res.data) {
        throw res.error || "'data' is missing";
      }
      this.logger.log(Home.name, "Response", LogLevel.VERBOSE, res);
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
          logger={this.logger}
          apiService={this.apiService}
          refreshCallback={this.refreshMarcs}
          currentMarcId={this.props.currentMarcId}
        />
        {this.props.currentMarcId ? (
          <Editor
            key={this.props.currentMarcId}
            logger={this.logger}
            apiService={this.apiService}
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
