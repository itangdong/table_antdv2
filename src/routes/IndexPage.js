import React from 'react';
import { connect } from 'dva';
import { Table } from 'antd';


const data = [{
  key: 1,
  name: 'John Brown sr.',
  age: 60,
  address: 'New York No. 1 Lake Park',
  children: [{
    key: 11,
    name: 'John Brown',
    age: 42,
    address: 'New York No. 2 Lake Park',
  }, {
    key: 12,
    name: 'John Brown jr.',
    age: 30,
    address: 'New York No. 3 Lake Park',
    children: [{
      key: 121,
      name: 'Jimmy Brown',
      age: 16,
      address: 'New York No. 3 Lake Park',
    }],
  }, {
    key: 13,
    name: 'Jim Green sr.',
    age: 72,
    address: 'London No. 1 Lake Park',
    children: [{
      key: 131,
      name: 'Jim Green',
      age: 42,
      address: 'London No. 2 Lake Park',
      children: [{
        key: 1311,
        name: 'Jim Green jr.',
        age: 25,
        address: 'London No. 3 Lake Park',
      }, {
        key: 1312,
        name: 'Jimmy Green sr.',
        age: 18,
        address: 'London No. 4 Lake Park',
        children: [
          {
            key: 131211,
            name: 'xxx',
            age: 18,
            address: 'London No. 5 Lake Park',
          }
        ],
      }],
    }],
  }],
}, {
  key: 2,
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}];
class antForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [],      // 选中的key列表
    };
    this.private = {
      pKeys: [],                // 需要被操作的父级节点的key
    };
  }
  // 操纵selectedRowKeys数组
  updateSelectedRowKeys = (type, arr) =>{
    const { selectedRowKeys } = this.state;
    const { pKeys } = this.private;
    const resultArr = arr.concat(pKeys);
    // 如果是新增key
    if(type === 'increase'){
      const keysArr = [...new Set(selectedRowKeys.concat(resultArr))];
      this.setState({
        selectedRowKeys: keysArr,
      })
    }
    // 否则是清除key
    if(type === 'reduce'){
      const keysArr = selectedRowKeys.filter(item => resultArr.indexOf(item) === -1);
      this.setState({
        selectedRowKeys: keysArr,
      })
    }
    // 清空
    if(pKeys && pKeys.length > 0){
      this.private.pKeys = [];
    }
  };

  // 不管新增还是减少，都需要找到它的父级
  searchParent = (pData, childKey, selectedRows, isAdd ) => {
    pData.children.map(item => {
      if(item.key === childKey){
        // 标记该父节点
        let flag = false;
        if(selectedRows.length > 0){
          // 父节点下所有子节点的key的列表
          const pDataKeys = pData.children.map(j => j.key);
          pDataKeys.map(k => {
            if(selectedRows.indexOf(k) === -1){
              flag = true;
            }
          });
        }
        if(isAdd){
          // 添加操作
          if(!flag && pData.key){
            this.private.pKeys.push(pData.key);
            selectedRows.push(pData.key)
            this.searchParent({children: data}, pData.key, selectedRows, isAdd);
          }
        } else {
          // 删除操作
          if(flag && pData.key){
            this.private.pKeys.push(pData.key);
            const newArr = selectedRows.filter(s => s !== pData.key);
            this.searchParent({children: data}, pData.key, newArr, isAdd);
          }
        }
        return false;
      }
      if(item.children && item.children.length > 0){
        this.searchParent({key: item.key, children: item.children}, childKey, selectedRows, isAdd)
      }
    })
  };

  // selected
  onSelect = (record, selected, selectedRows) => {
    const selectedRowsKeys = selectedRows.map(item => item.key);

    // 如果被选中的数组是空的，则全部清空
    if(selectedRowsKeys.length === 0){
      this.setState({
        selectedRowKeys: [],
      });
      return false;
    }
    // 需要一个数组装改变的key值
    const arr = [];
    const rowItems = [record];
    let item;
    // while递归children
    while (item = rowItems.shift()){
      arr.push(item.key);
      if(item.children && item.children.length > 0){
        rowItems.push(...item.children);
      }
    }
    // 新增的状态
    if(selected){
      // 找到父元素集合
      this.searchParent({children: data}, record.key, selectedRowsKeys, true);
      this.updateSelectedRowKeys('increase', arr );
    } else {
      // 减少的状态
      // 找到父元素集合
      this.searchParent({children: data}, record.key, selectedRowsKeys, false);
      this.updateSelectedRowKeys('reduce', arr);
    }
  };

  // 全选或取消全选
  onSelectAll = (selected, selectedRows) => {
    this.setState({
      selectedRowKeys: selected ? selectedRows.map(j => j.key) : [],
    })
  };

  render() {
    const { selectedRowKeys } = this.state;
    const { onSelect, onSelectAll } = this;
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '30%',
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    }];


    const rowSelection = {
      selectedRowKeys,
      onSelect,
      onSelectAll,
    };
    return <Table columns={columns} defaultExpandAllRows rowSelection={rowSelection} dataSource={data} />
  }
}



export default connect()(antForm);
