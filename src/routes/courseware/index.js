import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Toast } from 'components';
import Nav from 'components/nav';
import NoContent from 'components/nocontent';
import { routerRedux } from 'dva/router';
import { cookie, config, formateSeconds } from 'utils';
import WxImageViewer from 'react-wx-images-viewer';
import FileBox from './componnets/FilesBox';
import styles from './index.less';

const { userTag: { userloginname } } = config,
  { _cg } = cookie;

class CourseWare extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      startTime: 0,
      isShow: false
    };
  }

  componentDidMount () {
    const { courseid = '', cmid = '', type = 'mod', modname, coursewareID } = this.props.location.query;
    this.setState(() => ({
      startTime: new Date()
    }));
    this.props.dispatch({
      type: 'app/logApi',
      payload: {
        assesstime: new Date().getTime(),
        courseid,
        cmid,
        type,
        modname
      }
    });
  }

  componentWillUnmount () {
    const { courseid = '', cmid = '', modname = '' } = this.props.location.query;
    const { userLearningFlowID, data = {} } = this.props.courseware,
      { coursewareType } = data;
    this.props.dispatch({
      type: 'app/accessTime',
      payload: {
        startedat: this.state.startTime.getTime(),
        endedat: new Date().getTime(),
        courseid,
        cmid,
        modname
      }
    });
    if (coursewareType === 5 && userLearningFlowID !== '') {
      this.props.dispatch({
        type: 'courseware/updatePlayInfo',
        payload: {
          playEndTime: 1,
          userLearningFlowID
        }
      });
    }
    if (document.getElementById('video') && userLearningFlowID !== '') {
      this.props.dispatch({
        type: 'courseware/updatePlayInfo',
        payload: {
          playEndTime: parseInt(document.getElementById('video').currentTime, 10),
          userLearningFlowID
        }
      });
    }
  }

  getUrls = () => {
    const { data = {} } = this.props.courseware,
      { mediaPrefix, files = [] } = data;
    const newMediaPrefix = cnResmUrl ? mediaPrefix.replace(portalResourceUrl, cnResmUrl) : mediaPrefix
    if (!files) {
      return [];
    }
    const arr = [];
    files.map(item => arr.push(newMediaPrefix + item));
    return arr;
  };


  handleDivClick = (e) => {
    if (e.target.className === 'pic') {
      let src = e.target.src,
        curImageIndex = this.getUrls()
          .indexOf(src);
      if (src) {
        this.props.dispatch({
          type: 'courseware/updateState',
          payload: {
            isOpen: true,
            viewImageIndex: curImageIndex < 0 ? 0 : curImageIndex
          }
        });
      }
    }
  };

  autoHide = () => {
    const { userLearningFlowID } = this.props.courseware;
    if (userLearningFlowID === '') {
      this.setState({
        isShow: true
      });
      setTimeout(() => (
        this.setState({
          isShow: false
        })
      ), 5000);
    }
  };

  onClose = () => {
    this.props.dispatch({
      type: 'courseware/updateState',
      payload: {
        isOpen: false
      }
    });
  };

  handlerControl = (isOver) => {
    const { data = {} } = this.props.courseware;
    const { lastPlayLength = 0 } = data;
    if (isOver) {
      document.getElementById('video').currentTime = 0;
    } else {
      document.getElementById('video').currentTime = lastPlayLength;
    }
    document.getElementById('video')
      .play();
    this.setState({
      isShow: false
    });
  };

  renderVideo = (data) => {
    const { mediaPrefix, files, lastPlayLength = 0, coursewareDuration } = data;
    const isOver = lastPlayLength === coursewareDuration;
    const newMediaPrefix = cnResmUrl ? mediaPrefix.replace(portalResourceUrl, cnResmUrl) :mediaPrefix;
    return (
      <div className={styles.videoBox} onClick={this.handleDivClick}>
        {
          files.map((item, i) => (
            <video
              id="video"
              key={i}
              ref="video"
              controls="controls"
              controlsList="nodownload"
            >
              <source src={`${newMediaPrefix}${item}`} type="video/mp4" />
            </video>
          ))
        }
        <div
          className={styles.btnBox}
          style={{ display: this.state.isShow ? 'block' : 'none' }}
        >
          <span>{isOver ? '您已浏览过该视频' : `您上次观看至${formateSeconds(lastPlayLength)}`}</span>
          <span className={styles.btn} onClick={() => this.handlerControl(isOver)}>{isOver ? '重新播放' : '继续播放'}</span>
        </div>
      </div>
    );
  };

  renderImage = (data) => {
    const { mediaPrefix, files } = data;
    const { isOpen = false, viewImageIndex = -1 } = this.props.courseware;
    const newMediaPrefix = cnResmUrl ? mediaPrefix.replace(portalResourceUrl, cnResmUrl) : mediaPrefix
    return (
      <div onClick={this.handleDivClick}>
        {files.map((item, i) => (
          <img className="pic" key={i} src={`${newMediaPrefix}${item}`} alt="" />
        ))}
        {
          isOpen && viewImageIndex !== -1 ?
          <WxImageViewer onClose={this.onClose} urls={this.getUrls()} index={viewImageIndex} /> : ''
        }
      </div>
    );
  };
  renderPdf = (data) => {
    return (
      <FileBox data={data} />
    );
  };

  renderContent = (data) => {
    const { loading } = this.props;
    if (data.coursewareType === 5) { // 图片
      return this.renderImage(data);
    }
    if (data.coursewareType === 4) {
      return this.renderVideo(data);
    }
    if (data.coursewareType === 1) { // 图片
      return this.renderPdf(data);
    }
    if (data.coursewareType === 2 || data.coursewareType === 3) {
      this.props.dispatch(routerRedux.goBack());
      Toast.fail('该资源暂时不支持在移动端浏览');
    }
    return <NoContent isLoading={loading} />;
  };


  render () {
    const { name = '', coursewareID, courseid } = this.props.location.query;
    const { data = {} } = this.props.courseware;
    if (document.getElementById('video')) {
      const { lastPlayLength = 0 } = data;
      document.getElementById('video').onplay = (e) => {
        if (lastPlayLength > 0) {
          this.autoHide();
        }
        this.props.dispatch({
          type: 'courseware/addPlayInfo',
          payload: {
            coursewareID,
            sourceType: '1',
            terminal: '2',
            playStartTime: parseInt(e.target.currentTime, 10),
            courseID: courseid,
            userID: _cg(userloginname)
          }
        });
      };
    }
    return (
      <div>
        <Nav title={name} dispatch={this.props.dispatch} />
        <div className={styles.content}>
          <div className={styles.title}>{`课件名称:${data.coursewareName || '-'}`}</div>
          {this.renderContent(data)}
        </div>
      </div>
    );
  }
}

export default connect(({ loading, courseware, app }) => ({
  loading: loading.effects['courseware/queryDate'],
  courseware,
  app
}))(CourseWare);
