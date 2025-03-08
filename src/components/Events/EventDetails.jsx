import { Link, Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../util/http.js";

import Header from "../Header.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";
export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  console.log({ id });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none", //wont refresh immediately, but will refresh next time theyre required
      });
      navigate("/events");
    },
  });

  if (isLoading) {
    return (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="center">
        <p>Event not found</p>
      </div>
    );
  }

  function handleDelete(id) {
    console.log("Deleting event:", id);
    mutate({ id });
  }

  function enableDeleteModal() {
    setIsDeleting(true);
  }

  function disableDeleteModal() {
    setIsDeleting(false);
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={enableDeleteModal}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`${data.date}T${data.time}`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
        {isDeleting && (
          <Modal onClose={disableDeleteModal}>
            <h2>Are you sure?</h2>
            <p>This action cannot be be undone.</p>
            <div className="form-acitons">
              <button
                onClick={disableDeleteModal}
                disabled={isPending}
                className="button-text"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(data.id)}
                disabled={isPending}
                className="button"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        )}
      </article>
    </>
  );
}
