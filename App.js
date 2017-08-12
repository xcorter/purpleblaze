import React from 'react';
import { Platform, StyleSheet, Text, View, Image, Dimensions, TouchableHighlight, Modal, TextInput, Button } from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';

import cycleImg from './assets/images/cycle.png';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

let id = 0;
const backend = 'http://192.168.1.2:8000';

export default class App extends React.Component {
  state = {
    // location only
    location: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    errorMessage: null,
    // create mark only
    addMarkModalVisible: false,
    newMarkCoordinate: null,
    markerText: null,
    markers: [],
  };


  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  getMarks() {
    return fetch('http://192.168.1.2:8000/api/marks/')
       .then((response) => response.json())
       .then((responseJson) => {
         for (let i = 0; i < responseJson.message.length; i++) {
           let coordinateJson = responseJson.message[i].coordinate;
           responseJson.message[i].coordinate = JSON.parse(coordinateJson);
         }
         let marks = responseJson.message;
         this.setState({ markers: marks });
         return marks;
       })
       .catch((error) => {
         console.error(error);
       });
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let pos = await Location.getCurrentPositionAsync({});
    let location = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    this.setState({ location });
    this.getMarks();
  };

  _onMapPress = (e) => {
    this.showAdddMarkModal(true);
    newMarkCoordinate = e.nativeEvent.coordinate;
    this.setState({ newMarkCoordinate });
  }

  _onPressPlus = () => {
    let location = Object.assign({}, this.state.location);
    let latitudeDelta = location.latitudeDelta;
    let longitudeDelta = location.longitudeDelta;
    latitudeDelta -= 0.03;
    if (latitudeDelta < 0) {
      return;
    }
    longitudeDelta = latitudeDelta * ASPECT_RATIO;
    location.latitudeDelta = latitudeDelta;
    location.longitudeDelta = longitudeDelta;
    this.setState({ location });
  }

  _onPressMinus = () => {
    let location = Object.assign({}, this.state.location);
    let latitudeDelta = location.latitudeDelta;
    let longitudeDelta = location.longitudeDelta;
    latitudeDelta += 0.03;
    if (latitudeDelta > 1) {
      return;
    }
    longitudeDelta = latitudeDelta * ASPECT_RATIO;
    location.latitudeDelta = latitudeDelta;
    location.longitudeDelta = longitudeDelta;
    this.setState({ location });
  }

  showAdddMarkModal(visible) {
    this.setState({addMarkModalVisible: visible});
  }

  onMarkPress = (e) => {
    console.log(e.nativeEvent);
    console.log('cliiick');
  }

  saveMark = () => {
    let coord = JSON.stringify(this.state.newMarkCoordinate);
    fetch('http://192.168.1.2:8000/api/mark/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinate: coord,
        message: this.state.markerText,
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.getMarks();
      })
      .catch((error) => {
         console.error(error);
      });
    this.showAdddMarkModal(false);
  }

  render() {
    return (
      <View style={ styles.container }>
        <MapView
          style={{ flex: 1 }}
          onPress={this._onMapPress}
          region={this.state.location}
        >
          {
            this.state.markers.map(marker => (
             <MapView.Marker
               title={marker.key}
               image={cycleImg}
               key={marker.key}
               coordinate={marker.coordinate}
               onPress={this.onMarkPress}
             />
           ))
         }
        </MapView>
        <TouchableHighlight
          style={[styles.mapHighlightControl, styles.mapHighlightPlus]}
          onPress={this._onPressPlus}
        >
          <Image
            style={styles.mapControlImage}
            source={require('./assets/images/plus.png')}
          />
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.mapHighlightControl, styles.mapHighlightMinus]}
          onPress={this._onPressMinus}
        >
          <Image
            style={styles.mapControlImage}
            source={require('./assets/images/minus.png')}
          />
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.mapHighlightControl, styles.mapHighlightPosition]}
          onPress={this._getLocationAsync}
        >
          <Image
            style={styles.mapControlImage}
            source={require('./assets/images/currentpos.png')}
          />
        </TouchableHighlight>

        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.addMarkModalVisible}
          onRequestClose={() => {
            this.showAdddMarkModal(false);
          }}
        >
         <View style={{marginTop: 22}}>
          <View>
            <Text>Укажите информацию о встрече</Text>
            <View style={styles.modalMultiInputWrapper}>
              <TextInput
                style={styles.modalMultiInput}
                multiline={true}
                onChangeText={(markerText) => this.setState({markerText})}
                value={this.state.markerText}
              />
            </View>
            <View style={styles.saveMarkButtonWrapper}>
              <Button onPress={this.saveMark} title="Создать метку" color="#841584" />
            </View>
          </View>
         </View>
        </Modal>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mapHighlightControl: {
    position: 'absolute',
    width: 50,
    height: 50,
    right: 20
  },
  mapControlImage: {
    width: 50,
    height: 50,
  },
  mapHighlightPlus: {
    top: 70
  },
  mapHighlightMinus: {
    top: 140
  },
  mapHighlightPosition: {
    top: 230
  },
  modalMultiInputWrapper: {
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
  },
  modalMultiInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1
  },
  saveMarkButtonWrapper: {
    marginTop: 20,
    alignItems: 'center'
  }
});
