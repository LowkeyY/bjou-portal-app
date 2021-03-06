import { parse } from 'qs';
import { model } from 'models/common';
import { Toast } from 'components';
import modelExtend from 'dva-model-extend';
import { getAttendance } from '../services/app';


export default modelExtend(model, {
  namespace: 'coach',
  state: {
    data: {}
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({ pathname, query, action }) => {
        const { courseid = '' } = query;
        if (pathname === '/coach') {
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
            data: data || {}
          }
        });
      } else {
        Toast.fail(data.message || '获取失败');
      }
    }
  }
});
