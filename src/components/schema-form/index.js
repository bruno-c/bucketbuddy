import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Form,
  Message,
  Dimmer,
  Loader,
  Icon,
  Label
} from 'semantic-ui-react';
import { schemaTagTypes, selectBoolean } from '../utils/tag-types';
import './SchemaForm.scss';

const SchemaForm = (props) => {
  const issueSubmittingError =
    'Hmm... There was an error submitting the form. Please verify your inputs and try again or enter a ticket on our repo.';

  const duplicateError =
    'You have duplicate field names. Please verify you have no field names that are the same!';

  const [state, setState] = useState({
    schemaValues: props.schemaValues
      ? props.schemaValues
      : [{ key: '', value: '', type: '' }]
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkIfDuplicateKeys = (schemaValues) => {
    for (let i = 0; i < schemaValues.length; i++) {
      let count = 0;
      const field = schemaValues[i];

      for (let j = i + 1; j < schemaValues.length; j++) {
        const innerField = schemaValues[j];

        if (innerField['key'] === field['key']) {
          count++;
        }
      }
      if (count >= 1) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    if (checkIfDuplicateKeys(state.schemaValues)) {
      setError(duplicateError);
    } else {
      try {
        props.actionOnSubmit(state.schemaValues);
      } catch (e) {
        setError(issueSubmittingError);
      }
    }

    setLoading(false);
  };

  const addNewSchemaValue = (event) => {
    event.preventDefault();
    setState((prevState) => ({
      schemaValues: [
        ...prevState.schemaValues,
        { key: '', value: '', type: schemaTagTypes[0].value }
      ]
    }));
  };

  const removeSchemaValue = (event, { name }) => {
    event.preventDefault();
    const schemaValues = state.schemaValues;
    const index = parseInt(name);
    schemaValues.splice(index, 1);
    setState((prevState) => ({ schemaValues }));
  };

  const handleFieldChange = (event, { name, value }, row) => {
    const schemaValues = state.schemaValues;
    schemaValues[parseInt(row)][name] = value;
    setState((prevState) => ({ schemaValues }));
  };
  return (
    <div className="schema-form">
      <Dimmer active={loading}>
        <Loader indeterminate>Processing ...</Loader>
      </Dimmer>
      <Message>
        <Message.Header>{props.title}</Message.Header>
        {error == null ? (
          <p>
            {props.description
              ? props.description
              : 'Enter your field names and field inputs to be applied'}
          </p>
        ) : (
          <p className="error-message">{error}</p>
        )}
      </Message>
      <Form onSubmit={handleSubmit}>
        {state.schemaValues.map((schemaValue, idx) => {
          const key = 'key',
            value = 'value',
            type = 'type';
          console.log(
            schemaValue,
            schemaValue[type] === undefined && schemaValue[type] === ''
          );

          return (
            <>
              <Form.Group className="field-row">
                <Form.Button
                  width={1}
                  fluid
                  color="red"
                  className="button-fit-content"
                  onClick={removeSchemaValue}
                >
                  <Icon name="cancel" />
                </Form.Button>
                <Form.Select
                  width={3}
                  fluid
                  name={type}
                  options={schemaTagTypes}
                  label="Field Type"
                  required
                  defaultValue={
                    !schemaValue[type] && schemaValue[type] === ''
                      ? schemaTagTypes[0].value
                      : schemaValue[type]
                  }
                  onChange={(event, data) =>
                    handleFieldChange(event, data, idx)
                  }
                />
                {props.editFieldName ? (
                  <Form.Input
                    width={6}
                    fluid
                    name={key}
                    label="Field Name"
                    required
                    placeholder="Enter field name here"
                    value={schemaValue[key]}
                    onChange={(event, data) =>
                      handleFieldChange(event, data, idx)
                    }
                  />
                ) : (
                  <Label>{schemaValue[key]}</Label>
                )}
                {schemaValue[type] === 'flag' ? (
                  <Form.Select
                    width={6}
                    fluid
                    name={value}
                    options={selectBoolean}
                    label="Field Input"
                    required
                    defaultValue={
                      typeof schemaValue[value] === 'boolean'
                        ? schemaValue[value]
                        : selectBoolean[0].value
                    }
                    onChange={(event, data) =>
                      handleFieldChange(event, data, idx)
                    }
                  />
                ) : (
                  <Form.Input
                    width={6}
                    fluid
                    name={value}
                    label="Field Input"
                    required
                    placeholder="Enter field input here"
                    value={schemaValue[value]}
                    onChange={(event, data) =>
                      handleFieldChange(event, data, idx)
                    }
                    type={schemaValue[type]}
                  />
                )}
              </Form.Group>
            </>
          );
        })}
        <div>
          <Button type="submit" primary>
            Submit
          </Button>
          {props.editFieldName ? (
            <Button onClick={addNewSchemaValue} secondary>
              Add field
            </Button>
          ) : (
            ''
          )}
        </div>
      </Form>
    </div>
  );
};
export default withRouter(SchemaForm);
