<template>
  <v-app id="patientList">
    <div>
      <v-toolbar flat color="white">
        <v-toolbar-title>Patient List</v-toolbar-title>
        <v-divider
            class="mx-3"
            inset
            vertical
          ></v-divider>

        <v-text-field
          v-model="search"
          label="Filter"
          single-line
          hide-details
        ></v-text-field>
        <v-btn color="primary" dark class="mb-2" v-on:click="searchId()">Search Id</v-btn>
          
          <v-spacer>
          </v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark class="mb-2" v-on:click="addPatient()">New Patient</v-btn>
            </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }} {{editedItem.id}}</span>
            </v-card-title>
  
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.mobilePhone" mask='(###) ### - ####' label="Phone Number"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.firstName" label="First Name"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.lastName" label="Last Name"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.streerAdress" label="Street Adress"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.city" label="City"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.state" label="State"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.postalCode" mask='#####' label="Postal Code"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-select v-model="editedItem.conditions" :items="conditions" label="Condition" item-text="name" return-object></v-select>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-select v-model="editedItem.status" :items="statuses" label="Status"></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
  
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text v-on:click="close()">Cancel</v-btn>
                <v-btn color="blue darken-1" text v-on:click="save()">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="patientsToShow"
        :search="search"
        :rows-per-page-items="[5, 10, 25]"
        item-key="id"
        class="elevation-1"
      >
        
        <template v-slot:items="props" >
          <tr >
            <td class="text-xs-right">{{ props.item.id }}</td>
            <td>{{props.item.mobilePhone}}</td>
            <td>{{props.item.firstName}}</td>
            <td>{{props.item.lastName}}</td>
            <td>{{props.item.streerAdress}}</td>
            <td>{{props.item.city}}</td>
            <td>{{props.item.state}}</td>
            <td>{{props.item.postalCode}}</td>
            <td>{{props.item.conditions.name}}</td>
            <td>{{props.item.status}}</td>
            <td :key="forecastRender">{{props.item.forecast}}</td>
            <td class="text-xs-right">
              <tr>
                <v-btn flat color="primary" v-on:click="editPatient(props.item)">Edit Patient</v-btn>
              </tr>
              <tr>
                <v-btn flat color="error" v-on:click="deletePatient(props.item)">Delete</v-btn>
              </tr>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </v-app>
</template>

<script>
import cloneDeep from 'lodash/clonedeep'

export default {
  name: 'PatientList',

  data() {
    return {
      dialog: false,
      search: '',
      headers: [{text: 'Id', value: 'id', }, {text: 'Phone Number', value: 'mobilePhone', searchable: false }, 
                {text: 'First Name', value: 'firstName' }, {text: 'Last Name', value: 'lastName' },
                {text: 'Street Adress', value: 'streerAdress' }, {text: 'City', value: 'city' }
                ,{text: 'State', value: 'state' }, {text: 'Postal Code', value: 'postalCode' },
                {text: 'Conditions', value: 'conditions' },{text: 'Status', value: 'status' },
                {text: 'Air Condition', value: 'forecast' }, {text: 'Actions', value: 'actions', sortable: false }],
      statuses: ['active', 'inactive'],
      patients: [],
      searchIdPatient: [],
      patientsToShow: [],
      conditions: [],
      editedIndex: -1,
      editedItem: {
        id: 0,
        mobilePhone: '',
        firstName: '',
        lastName: '',
        streerAdress: '',
        city: '',
        state: '',
        postalCode: '',
        conditions: {},
        status: '',
        forecast: ''
      },
      forecastRender: 0
    }
  },

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Patient' : 'Edit Patient'
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created() {
    this.axios
      .get('https://virtserver.swaggerhub.com/TactioHealth/piony/1.0.2/patients/')
      .then(responsePatients => {
        this.patients = responsePatients.data;
        for(var i = 0; i < 30; i++) {
          var patientToPush = cloneDeep(this.patients[0]);
          this.patients.push(patientToPush);
        }
        this.patientsToShow = this.patients;
        
        this.patients.forEach(patient => {
          this.getAirForecast(patient);
        });
      });
    this.axios
      .get('https://virtserver.swaggerhub.com/TactioHealth/piony/1.0.2/conditions/')
      .then(responseConditions => {
        this.conditions = responseConditions.data;
      });
  },
    methods: {
        getAirForecast(patient) {
            this.axios
            .get('https://open.propellerhealth.com/prod/forecast', {
              params: {
                postalCode: patient.postalCode
              }
            })
            .then(responseForecast => {
              patient['forecast'] = responseForecast.data.properties.code;
              this.forecastRender += 1;
            });
        },
        addPatient (item) {
          this.editedIndex = -1;
          this.dialog = true;
        },
        deletePatient (item) {
          const index = this.patients.indexOf(item);
          if(confirm('Are you sure you want to delete this item?') && this.patients.splice(index, 1)) {
            this.axios
              .delete('https://virtserver.swaggerhub.com/TactioHealth/piony/1.0.2/patients/' + patientToDelete.id)
              .then(responseDelete => {
                if(responseDelete.status == 200) {
                  this.patients = this.patients.filter(function(patient){
                    return patient != patientToDelete;
                  });
                }
              });
          }
        },
        editPatient (item) {
          this.editedIndex = this.patients.indexOf(item);
          this.editedItem = Object.assign({}, item);
          this.dialog = true;
        },
        close () {
          this.dialog = false;
          setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem);
            this.editedIndex = -1;
          }, 300)
        },
        save () {
          if (this.editedIndex > -1) {
            if(this.patients[this.editedIndex].forecast != this.editedItem.forecast) {
              Object.assign(this.patients[this.editedIndex], this.editedItem);
              getAirForecast(this.patients[this.editedIndex]);
            } else {
              Object.assign(this.patients[this.editedIndex], this.editedItem);
            }
            
          } else {
            this.patients.push(this.editedItem);
          }
          var patientToSend = cloneDeep(this.editedItem);
          delete patientToSend.forecast;
          this.axios
            .put('https://virtserver.swaggerhub.com/TactioHealth/piony/1.0.2/patients/' + patientToSend.id, 
              patientToSend
            );
          this.close()
        },
        searchId () {
          var id = parseInt(this.search)
          this.searchIdPatient = [];
          if(isNaN(id)) {
            this.patientsToShow = this.patients;
          } else {
            this.axios
            .get('https://virtserver.swaggerhub.com/TactioHealth/piony/1.0.2/patients/' + id)
            .then(responsePatient => {
              if(responsePatient.data.id == id) {
                this.searchIdPatient.push(responsePatient.data);
                this.patientsToShow = this.searchIdPatient;
                this.getAirForecast(this.searchIdPatient[0]);
              }
              else {
                this.patientsToShow = [];
              }
            });
          }
        }
    }
}
</script>