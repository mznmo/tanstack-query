import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../util/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isError: errorUpdate,
    isPending: pendingUpdate,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      //onMutate for optimistic updating
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", id] }); //cancelling queries for this key to avoid clashing with the optimistic update
      const prevEvent = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], newEvent);

      return { prevEvent };
    },
    onSuccess: () => {
      navigate("../");
    },
    onError: (context) => {
      queryClient.setQueryData(["events", id], context.prevEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {errorUpdate && <p>Please fill in all fields.</p>}
      {isError ? (
        <>
          <p>Error occurred while fetching data details.</p>
          <Link to="../" className="button">
            Okay
          </Link>
        </>
      ) : isPending ? (
        <p>Loading event info...</p>
      ) : (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button" disabled={pendingUpdate}>
            {pendingUpdate ? "Updating details..." : "Update"}
          </button>
        </EventForm>
      )}
    </Modal>
  );
}
