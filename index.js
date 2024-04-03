import { LightningElement ,api,wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import checkDateTime from '@salesforce/apex/Check.checkDateTime';
import fetchAppointments from '@salesforce/apex/fetch.fetchAppointments';

// import fetchAppointments from '@salesforce/apex/Check.fetchAppointments';


export default class Index extends LightningElement {
    @track selectedTime;
    @track selectedDate;

    connectedCallback(){
        console.log('index of-->',this.selectedDate,' ',this.selectedTime);
    }

    handleDateChange(event){
        console.log('Date-->',event.detail.value);
        this.selectedDate = event.detail.value;
        console.log('selectedDate-->',this.selectedDate);
    }

    handleTimeChange(event){
        console.log('Time-->',event.detail.value);
        this.selectedTime = (event.detail.value);//.slice(0) + 'Z';
        console.log('Data type of selectedDate:', typeof this.selectedTime);
        console.log('selectedTime-->',this.selectedTime);
    }

    // handleTimeChange(event){
    //     console.log('Time-->', event.detail.value);
    //     const timeString = (event.detail.value).slice(0, -1) + 'Z'; // Assuming your time string is in UTC format
    //     this.selectedTime = new Date(timeString);
    //     console.log('Data type of selectedTime:', typeof this.selectedTime);
    //     console.log('selectedTime-->', this.selectedTime);
    // }
    

    handleSubmit(event) {
        console.log('onsubmit event recordEditForm', event);
    
        this.handleFetchAppointments();
    
        checkDateTime({ d1: this.selectedDate, t1: this.selectedTime })
            .then(resultc => {
                if (resultc) {
                    console.log('resultc-->', resultc);
                    if (this.appointmentsExist) {
                        this.showToast('Success', 'Appointment scheduled successfully!', 'success');
                    } else {
                        this.showToast('Error', 'Appointment slot not avalable.', 'error');
                        console.log('Appointment could not be scheduled.');
                        this.resetFormAction();
                    }
                } else {
                    // Handle case where resultc is false
                    this.showToast('Error', 'Selected date and time are not available.', 'error');
                    console.log('Selected date and time are not available.');
                    this.resetFormAction();
                }
            })
            .catch(error => {
                // Handle any errors from checkDateTime
                this.showToast('Error', error.body.message, 'error');
                console.log('Error in checkDateTime', error);
                this.resetFormAction();
            });
    }
    
    handleFetchAppointments() {
        fetchAppointments({ d1: this.selectedDate, t1: this.selectedTime })
            .then(result => {
                // Handle the result here
                console.log('Appointments fetched:', result);
                this.appointmentsExist = result;
                console.log('appointmentsExist');
            })
            .catch(error => {
                // Handle any errors from fetchAppointments
                console.error('Error fetching appointments:', error);
            });
    }
    

    handleSuccess(event) {
        console.log('onsuccess event recordEditForm', event.detail.id);
        this.resetFormAction();
        // this.showToast('Success','Your Appointment has been booked','success');
    }
    
    resetFormAction() {
        const lwcInputFields = this.template.querySelectorAll('lightning-input-field');
        if (lwcInputFields) {
            lwcInputFields.forEach(field => {
                field.reset();
            });
        }
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent); // Dispatch the toast event
    }
}
