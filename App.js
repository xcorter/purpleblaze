import React from 'react';
import { Platform, StyleSheet, Text, View, Image, Dimensions, TouchableHighlight, Modal, TextInput, Button } from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class App extends React.Component {
  state = {
    location: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    errorMessage: null,
    modalVisible: false,
    newMarkCoordinate: null,
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
  };

  _onMapPress = (e) => {
    this._setModalVisible(true);
    newMarkCoordinate = e.nativeEvent.coordinate;
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

  _setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }


  _saveMark = () => {

  }

  render() {
    return (
      <View style={ styles.container }>
        <MapView
          style={{ flex: 1 }}
          onPress={this._onMapPress}
          region={this.state.location}
        />
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
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this._setModalVisible(false);
          }}
          >
         <View style={{marginTop: 22}}>
          <View>
            <Text>Укажите информацию о встрече</Text>
            <View style={styles.modalMultiInputWrapper}>
              <TextInput
                style={styles.modalMultiInput}
                multiline={true}
              />
            </View>
            <View style={styles.saveMarkButtonWrapper}>
              <Button onPress={this._saveMark} title="Создать метку" color="#841584" />
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
