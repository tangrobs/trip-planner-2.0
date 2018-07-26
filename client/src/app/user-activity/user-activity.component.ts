import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Params,Router } from '@angular/router';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.css']
})
export class UserActivityComponent implements OnInit {
  trip_id:any;
  currentTrip={};
  newActivity={};
  constructor(
    private tripService:TripService,
    private route:ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params:Params)=>{
      this.trip_id=params['id'];
      this.tripService.findTripById(params['id']).subscribe(data=>{
        //make sure it exists
        if(data['title'] != null){
          this.currentTrip = data;
        }else{
          console.log("something went wrong");
        }
      });
    })
  }
  onSubmit(){
    this.tripService.createActivity(this.newActivity,this.trip_id).subscribe(data=>{
      //if succesfully created activity, added to our lists
      if(data['location'] != null){
        this.router.navigate(['/trips/plan/',this.currentTrip['id']]);
      } else{
        console.log("There are errors here")
      }
  });
  }
}
