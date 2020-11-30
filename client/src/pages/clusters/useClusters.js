import { useReducer, useEffect } from 'react';
import produce from 'immer';

const WAIT_FOR_ALL = true;

// Takes an array of objects and tranforms it into a map of objects, with ID
// being the key and the object being the value.
// e.g.
// [{ id: 'a1', x: 'hello' }, { id: 'b2', x: 'world' }] =>
// {
//   a1: { id: 'a1', x: 'hello' },
//   b2: { id: 'b2', x: 'world' }
// }
const arrayToMap = (arr) =>
  arr.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});

const grab = async (url, options) => {
  const response = await fetch(url, options);
  if (response.status !== 200) {
    throw Error();
  }
  const data = await response.json();
  return data;
};

function removeTagFromArray(arr, tag) {
  const index = arr.indexOf(tag);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function clusterReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };

    case 'DELETE_TAG': {
      const nextState = produce(state.data, (draftState) => {
        draftState[action.id].tags = removeTagFromArray(
          draftState[action.id].tags,
          action.tag
        );
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'FAILED_DELETE_TAG': {
      const nextState = produce(state.data, (draftState) => {
        const arr = draftState[action.id].tags;
        arr.push(action.tag);
        draftState[action.id].tags = arr;
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'DELETE_CLUSTER': {
      const nextState = produce(state.data, (draftState) => {
        draftState[action.id].state = 'deleting';
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'DELETE_ALL_CLUSTERS': {
      const nextState = produce(state.data, (draftState) => {
        action.ids.forEach(({ id }) => {
          draftState[id].state = 'deleting';
        });
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'ADD_TAG': {
      const nextState = produce(state.data, (draftState) => {
        action.clusters.forEach((cluster) => {
          const arr = draftState[cluster.id].tags;
          arr.push(action.tag);
          draftState[cluster.id].tags = arr;
        });
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'FAILED_ADD_TAG': {
      const nextState = produce(state.data, (draftState) => {
        action.clusters.forEach((cluster) => {
          const arr = draftState[cluster.id].tags;
          draftState[cluster.id].tags = removeTagFromArray(arr, action.tag);
        });
      });
      return {
        ...state,
        nextState,
      };
    }

    case 'UPDATE_TAG': {
      const nextState = produce(state.data, (draftState) => {
        draftState[action.id].tags = action.tags.map((t) => t.name);
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'UPDATE_WORKERS': {
      const nextState = produce(state.data, (draftState) => {
        draftState[action.id].workers = action.workers;
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'UPDATE_ALL_WORKERS': {
      const nextState = produce(state.data, (draftState) => {
        action.workers.forEach((w) => {
          if (w) {
            draftState[w.id].workers = w.workers;
          }
        });
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'UPDATE_ALL_TAGS': {
      const nextState = produce(state.data, (draftState) => {
        action.tags.forEach((t) => {
          if (t) {
            draftState[t.id].tags = t.tags.map((t) => t.name);
          }
        });
      });
      return {
        ...state,
        data: nextState,
      };
    }

    case 'UPDATE_COST':
      const nextState = produce(state.data, (draftState) => {
        draftState[action.id].cost = action.cost.bill;
      });
      return {
        ...state,
        data: nextState,
      };

    case 'UPDATE_ALL_COSTS': {
      const nextState = produce(state.data, (draftState) => {
        action.cost.forEach((c) => {
          if (c) {
            draftState[c.id].cost = c.cost.bill;
          }
        });
      });
      return {
        ...state,
        data: nextState,
      };
    }

    default:
      throw new Error();
  }
}

const useClusters = (accountID, query) => {
  const [state, dispatch] = useReducer(clusterReducer, {
    isLoading: false,
    isError: false,
    data: [],
  });

  const controller = new AbortController();
  const { signal } = controller;
  let cancelled = false;

  useEffect(() => {
    loadData();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [accountID]);

  const loadData = async () => {
    dispatch({ type: 'FETCH_INIT' });
    try {
      let _clusters = await grab('/api/v1/clusters', { signal });
      if(query.filter) {
        _clusters = _clusters.filter(cluster => cluster.name.includes(query.filter));
      }
      if (!cancelled) {
        const clusters = arrayToMap(_clusters);
        dispatch({ type: 'FETCH_SUCCESS', payload: clusters });

        const tagsPromises = Object.keys(clusters).map(async (id) => {
          try {
            const _tags = await grab('/api/v1/clusters/gettag', {
              signal,
              method: 'POST',
              body: JSON.stringify({
                crn: clusters[id].crn,
              }),
            });

            const tags = _tags.items;

            if (!WAIT_FOR_ALL && !cancelled) {
              dispatch({
                type: 'UPDATE_TAG',
                id,
                tags,
              });
            }
            return { id, tags };
          } catch {
            return undefined;
          }
        });

        if (WAIT_FOR_ALL) {
          Promise.all(tagsPromises).then((tags) => {
            if (!cancelled) {
              dispatch({
                type: 'UPDATE_ALL_TAGS',
                tags,
              });
            }
          });
        }

        // const costPromises = Object.keys(clusters).map(async (id) => {
        //   try {
        //     const cost = await grab("/api/v1/billing", {
        //       signal,
        //       method: "POST",
        //       body: JSON.stringify({
        //         crn: clusters[id].crn,
        //         accountID: accountID,
        //         clusterID: id,
        //       }),
        //     });

        //     if (!WAIT_FOR_ALL && !cancelled) {
        //       dispatch({
        //         type: "UPDATE_COST",
        //         id: id,
        //         cost: cost,
        //       });
        //     }
        //     return { id: id, cost: cost };
        //   } catch {
        //     return undefined;
        //   }
        // });
        // if (WAIT_FOR_ALL) {
        //   Promise.all(costPromises).then((cost) => {
        //     if (!cancelled) {
        //       dispatch({
        //         type: "UPDATE_ALL_COSTS",
        //         cost: cost,
        //       });
        //     }
        //   });
        // }
      }
    } catch {
      if (!cancelled) {
        dispatch({ type: 'FETCH_ERROR' });
      }
    }
  };

  const getWorkers = (clusters) => {
    const workerPromises = Object.keys(clusters).map(async (id) => {
      try {
        const workers = await grab(`/api/v1/clusters/${id}/workers`, {
          signal,
          method: 'GET',
        });
        if (!WAIT_FOR_ALL && !cancelled) {
          dispatch({
            type: 'UPDATE_WORKERS',
            id,
            workers,
          });
        }
        return { id, workers };
      } catch {
        return undefined;
      }
    });
    if (WAIT_FOR_ALL) {
      Promise.all(workerPromises).then((workers) => {
        if (!cancelled) {
          dispatch({ type: 'UPDATE_ALL_WORKERS', workers });
        }
      });
    }
  };

  const getBilling = (clusters) => {
    const costPromises = Object.keys(clusters).map(async (id) => {
      try {
        const cost = await grab('/api/v1/billing', {
          signal,
          method: 'POST',
          body: JSON.stringify({
            crn: clusters[id].crn,
            accountID,
            clusterID: id,
          }),
        });

        if (!WAIT_FOR_ALL && !cancelled) {
          dispatch({
            type: 'UPDATE_COST',
            id,
            cost,
          });
        }
        return { id, cost };
      } catch {
        return undefined;
      }
    });
    if (WAIT_FOR_ALL) {
      Promise.all(costPromises).then((cost) => {
        if (!cancelled) {
          dispatch({
            type: 'UPDATE_ALL_COSTS',
            cost,
          });
        }
      });
    }
  };

  const deleteTag = (id, tag, crn) => {
    try {
      grab('/api/v1/clusters/deletetag', {
        method: 'POST',
        body: JSON.stringify({
          tag_name: tag,
          resources: [{ resource_id: crn }],
        }),
      });

      dispatch({ type: 'DELETE_TAG', id, tag });
    } catch {
      /*
      dispatch 1 put it back
      distapch 2 add an error
      */
      dispatch({ type: 'FAILED_DELETE_TAG', id, tag });
      return undefined;
    }
  };

  const setTag = async (clusters, tag) => {
    if (tag === '') {
      return;
    }
    try {
      const resources = clusters.map((cluster) => ({
        resource_id: cluster.crn,
      }));

      await grab('/api/v1/clusters/settag', {
        method: 'POST',
        body: JSON.stringify({
          tag_name: tag,
          resources,
        }),
      });
    } catch {
      return undefined;
    }
    dispatch({ type: 'ADD_TAG', tag, clusters });
  };

  const deleteClusters = (_clusters) => {
    const clusters = arrayToMap(_clusters);
    const clusterDeletePromise = Object.keys(clusters).map(async (id) => {
      try {
        await grab('/api/v1/clusters', {
          method: 'DELETE',
          body: JSON.stringify({
            id,
            resourceGroup: clusters[id].resourceGroup,
            deleteResources: true,
          }),
        });

        dispatch({
          type: 'DELETE_CLUSTER',
          id,
        });

        return { id };
      } catch {
        return undefined;
      }
    });
  };

  const reload = () => {
    loadData();
  };

  return [
    state,
    {
      deleteClusters,
      deleteTag,
      setTag,
      reload,
      getBilling,
      getWorkers,
    },
  ];
};

export default useClusters;
