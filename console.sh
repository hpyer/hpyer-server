#!/bin/bash

# 执行控制台脚本

if [ $# -eq 0 ]; then
  echo "用法: ./console.sh 参数1 参数2"
  echo "参数1, 运行环境，可选值: production 或 develop"
  echo "参数2, 控制器访问路径，如：/console/xxx"
  exit
fi

if [ $1 != "production" -a $1 != "develop" ]; then
  echo "用法: ./console.sh 参数1 参数2"
  echo "参数1, 运行环境，可选值: production 或 develop"
  echo "参数2, 控制器访问路径，如：/console/xxx"
  exit
fi

echo "运行环境: $1"
echo "控制器访问路径: $2"

./node_modules/.bin/cross-env NODE_ENV=$1 node ./server/admin.js $2
