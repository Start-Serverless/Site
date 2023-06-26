/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ContactInput = {
  email: string,
  name: string,
  phone: string,
};

export type Contact = {
  __typename: "Contact",
  email: string,
  name: string,
  phone: string,
};

export type SubmitContactMutationVariables = {
  input?: ContactInput | null,
};

export type SubmitContactMutation = {
  submitContact?:  {
    __typename: "Contact",
    email: string,
    name: string,
    phone: string,
  } | null,
};

export type GetContactsQuery = {
  getContacts?:  Array< {
    __typename: "Contact",
    email: string,
    name: string,
    phone: string,
  } | null > | null,
};
