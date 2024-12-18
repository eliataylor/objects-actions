#!/bin/bash


echo "Install Databuilder"
npm install
echo "Creating Users"
npm run users-add
echo "Creating Objects"
npm run objects-add
