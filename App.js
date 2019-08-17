/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component, Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import { WheelPicker } from 'react-native-wheel-picker-android'

import licensePlateData from './python/license-plate-data.json';

const letterList = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  intro: {
    flex: 2,
    backgroundColor: '#fff'
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  results: {
    flex: 3,
    backgroundColor: '#fff'
  },
  picker: {
    width: '30%'
  }
});

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      result: 'Spin the wheels!'
    }

    this.selectedLetters = []

    this.selectedLetter1 = ''
    this.selectedLetter2 = ''
    this.selectedLetter3 = ''
  }

  onItemSelected = (selectedItem, index) => {
    this.selectedLetters[index] = letterList[selectedItem]
    console.log(this.selectedLetters)
    this.updateResult()
  }

  updateResult = () => {
    let selection = this.selectedLetters.join('')
    selection = selection.replace(/ +/g, '') // remove whitespace
    console.log(selection, licensePlateData[selection])

    let cur = licensePlateData[selection]
    if (cur === undefined) {
      this.setState({
        result: `${selection}: undefined`
      })
    } else {
      this.setState({
        result: `${selection}: ${cur.city} (${cur.source}) -- ${cur.county}`
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
      <View style={styles.intro}>
        <Text>Welcome</Text>
      </View>
      <View style={styles.pickerContainer}>
        <WheelPicker
          style={styles.picker}
          data={letterList}
          onItemSelected={item => this.onItemSelected(item, 0)}/>
        <WheelPicker
          style={styles.picker}
          data={letterList}
          onItemSelected={item => this.onItemSelected(item, 1)}/>
        <WheelPicker
          style={styles.picker}
          data={letterList}
          onItemSelected={item => this.onItemSelected(item, 2)}/>
        </View>
      <View style={styles.results}>
        <Text>{this.state.result}</Text>
      </View>
      </View>
    );
  }
}
