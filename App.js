/**
 * License plate picker App
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

import {WheelPicker} from 'react-native-wheel-picker-android';

import rawData from './python/license-plate-data.json';

const letterList = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  intro: {
    flex: 2,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  results: {
    flex: 3,
    backgroundColor: '#fff',
  },
  picker: {
    width: '30%',
  },
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      result: 'Spin the wheels!',

      letterListWheel0: letterList,
      letterListWheel1: [' '],
      letterListWheel2: [' '],

      itemPositionWheel0: 0,
      itemPositionWheel1: 0,
      itemPositionWheel2: 0,
    };

    this.selectedLetters = [' ', ' ', ' '];
  }

  onItemSelected(selectedItem, index) {
    // resetting the item position seems broken: https://github.com/kalontech/ReactNativeWheelPicker/issues/62

    console.log('BEFORE', this.selectedLetters)
    switch (index) {
      case 0:
        console.log('CASE 0');
        this.selectedLetters[0] = this.state.letterListWheel0[selectedItem];

        selectedItem = 0;
        // falls through
      case 1:
        console.log('CASE 1');

        this.setState({
          letterListWheel1: rawData.letterSuccession[this.selectedLetters[0]],
          itemPositionWheel1: selectedItem,
        });
        this.selectedLetters[1] = this.state.letterListWheel1[selectedItem];

        selectedItem = 0;
        // falls through
      case 2:
        console.log('CASE 2');

        let curPrefix = this.selectedLetters.slice(0, 2).join('');
        if (curPrefix.indexOf(' ') >= 0) {
          // current prefix contains space (at second position),
          // thus the third wheel must be empty
          this.setState({
            letterListWheel2: [' '],
            itemPositionWheel2: selectedItem,
          });
        } else {
          this.setState({
            letterListWheel2: rawData.letterSuccession[curPrefix],
            itemPositionWheel2: selectedItem,
          });
        }
        this.selectedLetters[2] = this.state.letterListWheel2[selectedItem];

        break;
    }
    console.log('AFTER', this.selectedLetters)

    this.updateResult();
  }

  updateResult() {
    let selection = this.selectedLetters.join('');
    selection = selection.replace(/ +/g, ''); // remove whitespace

    if (selection.length === 0) {
      // no selection was made
      this.setState({
        result: 'Spin the wheels!',
      });
      return;
    }

    let cur = rawData.licenseData[selection];
    console.log(this.selectedLetters, selection)
    console.log(cur)

    this.setState({
      result: `${selection}: ${cur.city} (${cur.source}) -- ${cur.county}`,
    });
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
            data={this.state.letterListWheel0}
            onItemSelected={item => this.onItemSelected(item, 0)}
            selectedItemPosition={this.state.itemPositionWheel0}
          />
          <WheelPicker
            style={styles.picker}
            data={this.state.letterListWheel1}
            onItemSelected={item => this.onItemSelected(item, 1)}
            selectedItemPosition={this.state.itemPositionWheel1}
          />
          <WheelPicker
            style={styles.picker}
            data={this.state.letterListWheel2}
            onItemSelected={item => this.onItemSelected(item, 2)}
            selectedItemPosition={this.state.itemPositionWheel2}
          />
        </View>
        <View style={styles.results}>
          <Text>{this.state.result}</Text>
        </View>
      </View>
    );
  }
}
