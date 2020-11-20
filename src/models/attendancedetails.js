import { parse } from 'qs';
import { model } from 'models/common';
import { Toast } from 'components';
import modelExtend from 'dva-model-extend';
import { getAttendance, refreshAttendance } from '../services/app';


export default modelExtend(model, {
  namespace: 'attendancedetails',
  state: {
    data: {},
    refreshing: false
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({ pathname, query, action }) => {
        const { courseid = '' } = query;
        if (pathname === '/attendancedetails') {
          if (action === 'PUSH') {
            dispatch({
              type: 'updateState',
              payload: {
                data: {}
              }
            });
            dispatch({
              type: 'fetch',
              payload: {
                courseid
              }
            });
          }
        }
      });
    }
  },

  effects: {
    * fetch ({ payload }, { call, put, select }) {
      const { users: { userid } } = yield select(_ => _.app),
        data = yield call(getAttendance, { ...payload, userid });
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            data
          }
        });
      } else {
        Toast.fail(data.message || '获取失败');
      }
    },
    * refreshAttendance ({ payload }, { call, put, select }) {
      const { users: { userid } } = yield select(_ => _.app),
        data = yield call(refreshAttendance, { ...payload, userid });
      if (data.success) {
        yield put({
          type: 'updateState',
          payload: {
            data,
            refreshing: false
          }
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            refreshing: false
          }
        });
        Toast.fail(data.message || '获取失败');
      }
    }
  }
});
