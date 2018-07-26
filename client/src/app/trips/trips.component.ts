import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TripService } from '../trip.service';
import { ActivatedRoute,Params } from '@angular/router';
import { } from '@types/googlemaps';


@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripsComponent implements OnInit {
  trip_id:any;
  currentTrip={};
  newActivity={};
  newAgenda={};
  droppedSuggestions:any;
  droppedProposed:any;

  //code to keep
  agendas=[];
  currentAgenda={};
  //end code to keep

  suggestions = [];
  suggestion_type = "restaurant";
  // google suggestion
  place: any;
  map: google.maps.Map;
  googleService: any;
  nearbySearchList = [];  // keep Esther's version
  @ViewChild('gmap') gmapElement: any;
  map_view = false;

  constructor(
    private tripService:TripService,
    private route:ActivatedRoute,
    private cdr:ChangeDetectorRef
  ){}
  ngOnInit() {
    //get current trip info
    this.route.params.subscribe((params:Params)=>{
      this.trip_id=params['id'];
      this.tripService.findTripById(params['id']).subscribe(data=>{
        //make sure it exists
        if(data['title'] != null){
          this.currentTrip = data;
          //set activities
          this.droppedSuggestions = this.currentTrip['proposedActivities'];
          //set agendas   
          for(let i=0; i < this.currentTrip['agendas'].length; ++i){
            //each agenda may contain a list of activities that we
            //are adding to agendas(array of arrays)
            this.agendas.push(this.currentTrip['agendas'][i]);
          }
          //set current agenda to day one (this might need to be changed)
          this.currentAgenda = this.agendas[0];
        }else{
          console.log("there were errors while fetching trip");
        }
      });
    });
    // google map
    var mapOptions = 
    this.map = new google.maps.Map(this.gmapElement.nativeElement, {
      center: {lat: -33.8688, lng: 151.2195},
      zoom: 13
    });
  }
  onSuggestionDrop(e: any) {
    console.log("triggered");
    //data from google is not an activity yet, so we need to create one
    this.newActivity={
      // Esther commented out Gustavo's code below:
      // description:e.dragData.description,
      // location:e.dragData.location
      // Esther added the following:
      description: "activity description goes here",
      // img_ref: e.dragData.
      lat: e.dragData.geometry.location.lat(),
      lng: e.dragData.geometry.location.lng(),
      location: e.dragData.name
    };
    console.log(this.newActivity)
    /*******An activity should be associated with a trip?******/
    this.tripService.createActivity(this.newActivity,this.trip_id).subscribe(data=>{
        //if succesfully created activity, added to our lists
        if(data['location'] != null){
          this.droppedSuggestions.push(data);
        } else{
          console.log("There are errors here")
        }
    });
  }

  //handles activities being dropped/moved into the agenda section
  onActivityDrop(e: any) {
    //pass both ids(agenda and activity) and update on the many side
    this.tripService.addActivityToAgenda(e.dragData.id,this.currentAgenda['id']).subscribe(data=>{
        if(data['location'] != null){
          console.log("successfully added activity to agenda");
          //add activity to current agenda day
          this.currentAgenda['activities'].push(data);
           //remove from list of proposed activities
           this.droppedSuggestions.splice(this.droppedSuggestions.indexOf(e.dragData),1);
        }else{
          console.log("errors adding act to agenda");
        }
    });
  }
  selectDay(day){
    console.log("clicked: "+day);
    this.currentAgenda = this.agendas[day-1];
  }

  // google searchbox
  apiCall(placeObj) {
    this.place = placeObj;
    this.getNearbySearches();
  }

  getNearbySearches() {
    this.googleService = new google.maps.places.PlacesService(this.map);
    var location = new google.maps.LatLng(this.place.geometry.location.lat(), this.place.geometry.location.lng());
    let request = {
      location: location,
      radius: '300',
      type: [this.suggestion_type]
    };
    this.googleService.nearbySearch(request, (results, status) => {
      this.suggestions = [];
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        this.nearbySearchList = results;
        console.log(this.nearbySearchList);
        // add to suggestions: NO LONGER NEEDED
        // for (var i = 0; i < results.length; i++) {
        //   var place = results[i];
        //   this.suggestions.push({location: place.name, description: "insert description here"});
        // }
        this.cdr.detectChanges();
      }
    })

  }
  goMapView() {
    if(!this.map_view) {
      this.map_view = true;
    } else {
      this.map_view = false;
    }
  }
  createNewDay(){
    console.log("I'd be creating day "+this.currentTrip['agendas'].length);
    let agenda = {
        day:this.currentTrip['agendas'].length+1,
        trip_id:this.trip_id,
        activities:[]
    }
    this.tripService.createAgenda(agenda,this.trip_id).subscribe(data=>{
      if(data['day'] != null){
        console.log("successfully added one day to trip");
        //this.currentTrip['agendas'].push(data);
        this.agendas.push(data);
      }else{
        console.log("error adding new day");
      }
    })
  }
  onDropDelete(e:any){
    this.tripService.deleteActivity(e.dragData.id).subscribe(data=>{
      //console.log("delete data: "+data);
      this.droppedSuggestions.splice(this.droppedSuggestions.indexOf(e.dragData),1);
      console.log(e.dragData);
    })
    
  }
}